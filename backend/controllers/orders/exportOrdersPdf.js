const path = require('path');
const PDFDocument = require('pdfkit');
const Order = require('../../models/Order');

const FONT_DIR = path.join(__dirname, '../../assets/fonts');

function registerI18nFonts(doc) {
  doc.registerFont('NotoArabic', path.join(FONT_DIR, 'NotoSansArabic-Regular.ttf'));
  doc.registerFont('NotoArabic-Bold', path.join(FONT_DIR, 'NotoSansArabic-Bold.ttf'));
  doc.registerFont('NotoHebrew', path.join(FONT_DIR, 'NotoSansHebrew-Regular.ttf'));
  doc.registerFont('NotoHebrew-Bold', path.join(FONT_DIR, 'NotoSansHebrew-Bold.ttf'));
}

// Arabic (incl. supplement/extended-A/presentation forms) and Hebrew (incl. presentation forms) blocks.
const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const HEBREW_RE = /[֐-׿יִ-ﭏ]/;

function scriptOf(text) {
  if (ARABIC_RE.test(text)) return 'arabic';
  if (HEBREW_RE.test(text)) return 'hebrew';
  return 'latin';
}

const I18N_FONTS = {
  arabic: { regular: 'NotoArabic', bold: 'NotoArabic-Bold' },
  hebrew: { regular: 'NotoHebrew', bold: 'NotoHebrew-Bold' },
  latin: { regular: 'Helvetica', bold: 'Helvetica-Bold' },
};

function i18nFont(doc, text, bold) {
  const script = scriptOf(text);
  const fonts = I18N_FONTS[script];
  doc.font(bold ? fonts.bold : fonts.regular);
  return script;
}

// Splits text into runs at script-vs-fallback glyph-coverage boundaries (whitespace
// attaches to whichever run is already open). A fallback (non-script) run — e.g. a
// Latin city/region name embedded in an Arabic address — is kept as ONE token even if
// it spans multiple words, so words like "Tulkarem, westBank" keep their relative
// order. Only script (RTL) runs are further split into per-word tokens, since those
// need their word order reversed; a Latin run never does.
function splitRuns(text, scriptRe) {
  const runs = [];
  let current = '';
  let currentIsScript = null;
  for (const ch of text) {
    const isScriptCh = scriptRe.test(ch);
    const cls = /\s/.test(ch) ? (currentIsScript === null ? false : currentIsScript) : isScriptCh;
    if (currentIsScript !== null && cls !== currentIsScript) {
      runs.push({ text: current, isScript: currentIsScript });
      current = '';
    }
    current += ch;
    currentIsScript = cls;
  }
  if (current) runs.push({ text: current, isScript: currentIsScript });
  return runs;
}

// The Noto Sans Arabic/Hebrew subset files only contain script-specific glyphs —
// digits and ASCII punctuation (e.g. the ", " address separator) aren't included,
// so they fall back to Helvetica, which has them. Builds on splitRuns by further
// breaking each script run into one-word tokens (fallback runs are left intact).
function tokenize(text, scriptRe) {
  const tokens = [];
  splitRuns(text, scriptRe).forEach((run) => {
    if (run.isScript && /\s/.test(run.text)) {
      run.text.split(/(\s+)/).filter(Boolean).forEach((part) => {
        tokens.push({ text: part, isScript: true });
      });
    } else {
      tokens.push(run);
    }
  });
  return tokens;
}

// Punctuation-only fragments (e.g. a trailing comma) should hug their neighboring
// word with no added gap; anything containing a letter/digit is a real word/phrase.
function isPureSymbol(text) {
  return /^[\s,.;:!?،؛؟\-_/\\]+$/.test(text);
}

// fontkit already reverses glyph order *within* each shaped chunk for RTL scripts
// (see fontkit's OTLayoutEngine: `if (direction === 'rtl') glyphs.reverse()`), and
// pdfkit shapes each whitespace-delimited chunk separately — so a single word drawn
// on its own already comes out visually correct. What's missing is the order of
// chunks *relative to each other*, since pdfkit just concatenates them as given. So
// text is stored in logical (reading) order; reversing the token sequence (words,
// punctuation, and the whitespace between them, but never characters within a
// token) restores correct RTL reading order while leaving each token's internal
// shaping untouched.
function i18nRuns(text, script) {
  if (script === 'latin') return [{ text, isScript: true }];
  const scriptRe = script === 'arabic' ? ARABIC_RE : HEBREW_RE;
  return tokenize(text, scriptRe).reverse();
}

function fontForRun(script, isScript, bold) {
  const fonts = isScript ? I18N_FONTS[script] : I18N_FONTS.latin;
  return bold ? fonts.bold : fonts.regular;
}

// Draws `text` as a single line at (x, y), using the correct embedded font per run
// (RTL scripts are right-aligned within `width`). Returns the line height drawn, so
// callers can advance their own cursor.
function drawI18nText(doc, text, x, y, width, bold, fillColor) {
  const script = scriptOf(text);
  const runs = i18nRuns(text, script);

  if (fillColor) doc.fillColor(fillColor);

  // A run boundary that crosses script <-> fallback (e.g. an Arabic word landing next
  // to a Latin city name after reversal) has no original whitespace to separate them,
  // so a small gap is inserted there — unless one side is bare punctuation, which
  // should stay glued to its neighboring word.
  let totalWidth = 0;
  let prevRun = null;
  const gaps = runs.map((run) => {
    doc.font(fontForRun(script, run.isScript, bold));
    const gap =
      prevRun && prevRun.isScript !== run.isScript && !isPureSymbol(prevRun.text) && !isPureSymbol(run.text)
        ? doc.widthOfString(' ')
        : 0;
    totalWidth += gap + doc.widthOfString(run.text);
    prevRun = run;
    return gap;
  });

  const align = script === 'latin' ? 'left' : 'right';
  let curX = align === 'right' && width != null ? x + Math.max(0, width - totalWidth) : x;

  let lineHeight = 0;
  runs.forEach((run, i) => {
    doc.font(fontForRun(script, run.isScript, bold));
    curX += gaps[i];
    doc.text(run.text, curX, y, { lineBreak: false });
    curX += doc.widthOfString(run.text);
    lineHeight = Math.max(lineHeight, doc.currentLineHeight());
  });

  return lineHeight;
}

const STATUS_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
};

const COLOR = {
  black: '#111827',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  border: '#E5E7EB',
  panel: '#F9FAFB',
  green: '#16A34A',
  greenDark: '#15803D',
  white: '#FFFFFF',
};

const PAGE_MARGIN = 36;
const PAGE_WIDTH = 595.28;
const CONTENT_LEFT = PAGE_MARGIN;
const CONTENT_RIGHT = PAGE_WIDTH - PAGE_MARGIN;
const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT;
const PAGE_BOTTOM = 790;

const exportOrdersPdf = async (req, res) => {
  try {
    const { from, to, status } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'Both "from" and "to" dates are required' });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    toDate.setHours(23, 59, 59, 999);

    const query = { createdAt: { $gte: fromDate, $lte: toDate } };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: 1 });

    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });
    registerI18nFonts(doc);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="orders_${from}_to_${to}.pdf"`);
    doc.pipe(res);

    drawHeader(doc, fromDate, toDate, status);

    if (orders.length === 0) {
      doc.moveDown(2);
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(COLOR.gray)
        .text('No orders found for the selected filters.', CONTENT_LEFT, doc.y, {
          width: CONTENT_WIDTH,
          align: 'center',
        });
      doc.end();
      return;
    }

    let grandTotal = 0;

    orders.forEach((order, idx) => {
      const boxHeight = measureOrderHeight(doc, order);

      if (doc.y + boxHeight > PAGE_BOTTOM) {
        doc.addPage();
        doc.y = PAGE_MARGIN;
      } else if (idx > 0) {
        doc.moveDown(0.9);
      }

      drawOrderCard(doc, order, boxHeight);
      grandTotal += order.totalPrice || 0;
    });

    drawFooterSummary(doc, orders.length, grandTotal);

    doc.end();
  } catch (error) {
    console.error('exportOrdersPdf error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to export orders' });
    } else {
      res.end();
    }
  }
};

function drawHeader(doc, fromDate, toDate, status) {
  doc.font('Helvetica-Bold').fontSize(22).fillColor(COLOR.black)
    .text('Shoplix', CONTENT_LEFT, doc.y, { continued: true });
  doc.fillColor(COLOR.green).text(' Orders Report');

  doc.moveDown(0.35);
  doc.font('Helvetica').fontSize(10.5).fillColor(COLOR.gray)
    .text(`${fromDate.toDateString()}  -  ${toDate.toDateString()}`, CONTENT_LEFT, doc.y);

  if (status) {
    doc.moveDown(0.15);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR.greenDark)
      .text(`Status filter: ${STATUS_LABELS[status] || status}`, CONTENT_LEFT, doc.y);
  }

  doc.moveDown(0.7);
  doc.moveTo(CONTENT_LEFT, doc.y).lineTo(CONTENT_RIGHT, doc.y).lineWidth(1.5).strokeColor(COLOR.black).stroke();
  doc.moveDown(1);
}

const CARD_PAD_X = 18;
const CARD_PAD_Y = 16;

function getOrderTexts(order) {
  const customerName = order.user
    ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Customer'
    : 'Unknown';
  const addr = order.shippingAddress || {};
  const addressText =
    [addr.description, addr.city, addr.region].filter(Boolean).join(', ') || 'No address on file';
  return { customerName, addr, addressText };
}

// Mirrors drawOrderCard's layout exactly so the reserved card height always
// matches what actually gets painted (pdfkit has no way to draw a background
// box "behind" content already drawn, so the height must be known up front).
function measureOrderHeight(doc, order) {
  const innerWidth = CONTENT_WIDTH - CARD_PAD_X * 2;
  const colWidth = innerWidth / 2 - 10;
  const addrWidth = innerWidth - innerWidth / 2 - 10;
  const { customerName, addr, addressText } = getOrderTexts(order);

  let h = CARD_PAD_Y;
  h += 22; // order # + status pill line
  if (order.estimatedDelivery) h += 14;
  h += 6;

  doc.font('Helvetica-Bold').fontSize(8);
  const labelH = doc.heightOfString('CUSTOMER', { width: colWidth, characterSpacing: 0.6 });
  i18nFont(doc, customerName, true);
  doc.fontSize(10);
  const nameH = doc.heightOfString(customerName, { width: colWidth });
  let phoneH = 0;
  if (addr.phone) {
    i18nFont(doc, addr.phone, false);
    doc.fontSize(9);
    phoneH = doc.heightOfString(addr.phone, { width: colWidth });
  }
  const customerBlockH = labelH + 3 + nameH + (addr.phone ? 2 + phoneH : 0);

  doc.font('Helvetica-Bold').fontSize(8);
  const addrLabelH = doc.heightOfString('DELIVERY ADDRESS', { width: addrWidth, characterSpacing: 0.6 });
  i18nFont(doc, addressText, false);
  doc.fontSize(9.5);
  const addrTextH = doc.heightOfString(addressText, { width: addrWidth });
  const addressBlockH = addrLabelH + 3 + addrTextH;

  h += Math.max(customerBlockH, addressBlockH) + 16;

  h += 20; // item table header bar
  h += (order.items || []).length * 19;
  h += 12 + 10; // divider + gap
  h += 14 * 3; // shipping / discount / payment lines
  h += 18; // total line
  h += CARD_PAD_Y;

  return h;
}

function drawOrderCard(doc, order, boxHeight) {
  const startY = doc.y;

  doc.roundedRect(CONTENT_LEFT, startY, CONTENT_WIDTH, boxHeight, 8)
    .fillAndStroke(COLOR.panel, COLOR.border);

  let cursorY = startY + CARD_PAD_Y;
  const innerLeft = CONTENT_LEFT + CARD_PAD_X;
  const innerRight = CONTENT_RIGHT - CARD_PAD_X;
  const innerWidth = innerRight - innerLeft;

  // ---- Order # + status pill ----
  doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR.black)
    .text(`Order #${order._id.toString().slice(-8).toUpperCase()}`, innerLeft, cursorY);

  const statusLabel = STATUS_LABELS[order.status] || order.status;
  doc.font('Helvetica-Bold').fontSize(9);
  const pillWidth = doc.widthOfString(statusLabel) + 20;
  const pillX = innerRight - pillWidth;
  doc.roundedRect(pillX, cursorY - 2, pillWidth, 18, 9).fill(COLOR.green);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.white)
    .text(statusLabel, pillX, cursorY + 2, { width: pillWidth, align: 'center' });

  cursorY += 22;
  if (order.estimatedDelivery) {
    doc.font('Helvetica').fontSize(8.5).fillColor(COLOR.grayLight)
      .text(`Estimated delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}`, innerLeft, cursorY);
    cursorY += 14;
  }

  cursorY += 6;

  // ---- Customer + delivery address (two columns) ----
  const colWidth = innerWidth / 2 - 10;
  const addrColX = innerLeft + innerWidth / 2 + 10;
  const colTopY = cursorY;

  const { customerName, addr, addressText } = getOrderTexts(order);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.gray)
    .text('CUSTOMER', innerLeft, colTopY, { characterSpacing: 0.6 });

  doc.fontSize(10);
  const nameY = doc.y + 3;
  const nameH = drawI18nText(doc, customerName, innerLeft, nameY, colWidth, true, COLOR.black);
  let customerBottomY = nameY + nameH;

  if (addr.phone) {
    doc.fontSize(9);
    const phoneY = customerBottomY + 2;
    const phoneH = drawI18nText(doc, addr.phone, innerLeft, phoneY, colWidth, false, COLOR.gray);
    customerBottomY = phoneY + phoneH;
  }

  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.gray)
    .text('DELIVERY ADDRESS', addrColX, colTopY, { characterSpacing: 0.6 });

  doc.fontSize(9.5);
  const addrY = doc.y + 3;
  const addrColWidth = innerWidth - innerWidth / 2 - 10;
  const addrH = drawI18nText(doc, addressText, addrColX, addrY, addrColWidth, false, COLOR.black);

  cursorY = Math.max(cursorY, customerBottomY, addrY + addrH) + 16;

  // ---- Items table ----
  const colItem = innerLeft;
  const colVariant = innerLeft + innerWidth * 0.34;
  const colQty = innerLeft + innerWidth * 0.6;
  const colPrice = innerLeft + innerWidth * 0.72;
  const colSubtotal = innerLeft + innerWidth * 0.86;

  doc.roundedRect(innerLeft, cursorY, innerWidth, 20, 4).fill(COLOR.black);
  const headerTextY = cursorY + 6;
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR.white);
  doc.text('ITEM', colItem + 8, headerTextY);
  doc.text('VARIANT', colVariant, headerTextY);
  doc.text('QTY', colQty, headerTextY, { width: 40, align: 'right' });
  doc.text('PRICE', colPrice, headerTextY, { width: 60, align: 'right' });
  doc.text('SUBTOTAL', colSubtotal, headerTextY, { width: innerRight - colSubtotal - 8, align: 'right' });

  cursorY += 20;

  (order.items || []).forEach((item, i) => {
    const rowY = cursorY;
    const rowHeight = 19;
    if (i % 2 === 1) {
      doc.rect(innerLeft, rowY, innerWidth, rowHeight).fill('#F0FDF4');
    }
    const textY = rowY + 4.5;
    const variantText = [item.color, item.storage].filter(Boolean).join(' / ') || '-';
    const subtotal = (item.price || 0) * (item.quantity || 0);

    doc.fontSize(9);
    drawI18nText(doc, item.productName || 'Item', colItem + 8, textY, colVariant - colItem - 12, false, COLOR.black);

    doc.fontSize(9);
    drawI18nText(doc, variantText, colVariant, textY, colQty - colVariant - 6, false, COLOR.gray);

    doc.font('Helvetica').fontSize(9).fillColor(COLOR.black);
    doc.text(String(item.quantity || 0), colQty, textY, { width: 40, align: 'right' });
    doc.text(`$${(item.price || 0).toFixed(2)}`, colPrice, textY, { width: 60, align: 'right' });
    doc.font('Helvetica-Bold').text(`$${subtotal.toFixed(2)}`, colSubtotal, textY, {
      width: innerRight - colSubtotal - 8,
      align: 'right',
    });

    cursorY += rowHeight;
  });

  cursorY += 12;
  doc.moveTo(innerLeft, cursorY).lineTo(innerRight, cursorY).strokeColor(COLOR.border).stroke();
  cursorY += 10;

  // ---- Cost summary ----
  const summaryLabelX = innerRight - 220;
  const summaryValueWidth = 220;

  const summaryLine = (label, value) => {
    doc.font('Helvetica').fontSize(9).fillColor(COLOR.gray)
      .text(label, summaryLabelX, cursorY, { width: 110 });
    doc.font('Helvetica').fontSize(9).fillColor(COLOR.black)
      .text(value, summaryLabelX + 110, cursorY, { width: summaryValueWidth - 110, align: 'right' });
    cursorY += 14;
  };

  summaryLine('Shipping', `$${(order.shippingCost || 0).toFixed(2)}`);
  summaryLine('Discount', `-$${(order.discount || 0).toFixed(2)}`);
  summaryLine('Payment method', (order.paymentMethod || 'cash_on_delivery').replace(/_/g, ' '));

  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR.green)
    .text('Total', summaryLabelX, cursorY, { width: 110 });
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR.green)
    .text(`$${(order.totalPrice || 0).toFixed(2)}`, summaryLabelX + 110, cursorY, {
      width: summaryValueWidth - 110,
      align: 'right',
    });

  doc.y = Math.max(startY + boxHeight, cursorY + 18);
  doc.x = CONTENT_LEFT;
}

function drawFooterSummary(doc, totalOrders, grandTotal) {
  if (doc.y + 50 > PAGE_BOTTOM) {
    doc.addPage();
    doc.y = PAGE_MARGIN;
  } else {
    doc.moveDown(1.2);
  }

  const barY = doc.y;
  const barHeight = 42;
  doc.roundedRect(CONTENT_LEFT, barY, CONTENT_WIDTH, barHeight, 8).fill(COLOR.black);

  doc.font('Helvetica').fontSize(9.5).fillColor(COLOR.grayLight)
    .text('TOTAL ORDERS', CONTENT_LEFT + 20, barY + 9, { characterSpacing: 0.5 });
  doc.font('Helvetica-Bold').fontSize(15).fillColor(COLOR.white)
    .text(String(totalOrders), CONTENT_LEFT + 20, barY + 20);

  doc.font('Helvetica').fontSize(9.5).fillColor(COLOR.grayLight)
    .text('GRAND TOTAL', CONTENT_LEFT, barY + 9, { width: CONTENT_WIDTH - 20, align: 'right', characterSpacing: 0.5 });
  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR.green)
    .text(`$${grandTotal.toFixed(2)}`, CONTENT_LEFT, barY + 19, { width: CONTENT_WIDTH - 20, align: 'right' });
}

module.exports = exportOrdersPdf;
