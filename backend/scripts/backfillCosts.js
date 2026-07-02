/**
 * One-off backfill: populate estimated costPrice on product variants and
 * cost snapshots on existing order items, so profit analytics have data.
 *
 * Run:  node scripts/backfillCosts.js
 * Safe to re-run (idempotent — only fills missing values unless --force).
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { resolveCost, DEFAULT_COST_RATIO } = require("../config/finance");

const FORCE = process.argv.includes("--force");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected. Cost ratio = ${DEFAULT_COST_RATIO} (gross margin ${Math.round((1 - DEFAULT_COST_RATIO) * 100)}%)`);

  // ---- Variants ----
  const products = await Product.find({});
  let variantUpdates = 0;
  for (const product of products) {
    let changed = false;
    for (const v of product.variants) {
      if (FORCE || typeof v.costPrice !== "number") {
        v.costPrice = resolveCost(v.price || 0);
        variantUpdates++;
        changed = true;
      }
    }
    if (changed) await product.save();
  }
  console.log(`✔ Variants backfilled: ${variantUpdates}`);

  // ---- Order items ----
  const orders = await Order.find({});
  let orderUpdates = 0;
  for (const order of orders) {
    let changed = false;
    for (const item of order.items) {
      if (FORCE || typeof item.cost !== "number") {
        item.cost = resolveCost(item.price || 0);
        changed = true;
      }
    }
    if (changed) {
      orderUpdates++;
      await order.save();
    }
  }
  console.log(`✔ Orders backfilled: ${orderUpdates}`);

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
})().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
