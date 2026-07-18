const Notification = require("../models/Notification");

// Announce a bundle offer to ALL customers the first time it goes live:
// one broadcast notification (user: null — every user's feed picks it up)
// plus a real-time socket push to everyone connected.
//
// "Live" = status active AND now within [startDate, endDate]. Called after
// every create/update save; the announcedAt guard makes it a no-op on
// drafts, scheduled offers, and repeat edits — an offer announces once.
async function maybeAnnounceOffer(io, offer) {
  try {
    if (!offer || offer.announcedAt) return null;

    const now = new Date();
    const isLive =
      offer.status === "active" && offer.startDate <= now && offer.endDate >= now;
    if (!isLive) return null;

    // Per-language titles so the frontend renders the offer name in the
    // viewer's language (params.titles wins over the canonical fallback).
    const titles = {
      en: offer.translations?.en?.title || offer.title,
      ar: offer.translations?.ar?.title || offer.title,
      he: offer.translations?.he?.title || offer.title,
    };

    const notification = await Notification.create({
      user: null, // broadcast
      type: "promotion",
      event: "new_offer",
      titleKey: "notifications.events.new_offer.title",
      messageKey: "notifications.events.new_offer.message",
      params: { title: offer.title, titles, offerId: offer._id.toString() },
      title: "New offer",
      message: `"${offer.title}" is now live — for a limited time.`,
      read: false,
    });

    // Everyone currently connected gets it instantly (offline users see it on
    // their next fetch via the broadcast query).
    if (io) io.emit("new_notification", notification);

    offer.announcedAt = now;
    await offer.save();

    return notification;
  } catch (err) {
    // Announcing must never break the admin's save.
    console.error("maybeAnnounceOffer failed:", err.message);
    return null;
  }
}

module.exports = { maybeAnnounceOffer };
