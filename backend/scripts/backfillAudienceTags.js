// One-time backfill: heuristically classify existing products into audience
// tags (kids/young/women/men/elderly) from category + name. Idempotent —
// products that already have tags are skipped (pass --force to overwrite).
// Run:  node scripts/backfillAudienceTags.js
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
require("../models/Category"); // register schema for the populate below

const RULES = [
  { match: /phone|laptop|computer|electronics/i, tags: ["young", "men", "women"] },
  { match: /wearable|smart watch|watch/i, tags: ["young", "men", "women"] },
  { match: /fitness|band/i, tags: ["young", "men", "women"] },
  { match: /audio|headphone|speaker/i, tags: ["young", "men", "women"] },
  { match: /furniture|desk|table/i, tags: ["men", "women", "elderly"] },
  { match: /appliance|juicer|blender|kitchen/i, tags: ["women", "men", "elderly"] },
  { match: /tent|outdoor|camping/i, tags: ["young", "men"] },
  { match: /garden/i, tags: ["men", "women", "elderly"] },
];
const KEYWORDS = [
  { match: /family/i, tags: ["kids"] },
  { match: /study|school/i, tags: ["kids", "young"] },
  { match: /office/i, tags: ["men", "women"] },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const force = process.argv.includes("--force");

  const products = await Product.find().populate("category", "name").lean();
  let updated = 0, skipped = 0;

  for (const p of products) {
    if (!force && p.audienceTags?.length) { skipped++; continue; }

    const text = `${p.name} ${p.category?.name || ""}`;
    const tags = new Set();
    for (const r of RULES) if (r.match.test(text)) r.tags.forEach((t) => tags.add(t));
    for (const k of KEYWORDS) if (k.match.test(p.name)) k.tags.forEach((t) => tags.add(t));

    await Product.updateOne({ _id: p._id }, { $set: { audienceTags: [...tags] } });
    console.log(`  ${p.name}  →  [${[...tags].join(", ") || "everyone"}]`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated}, skipped ${skipped} (already tagged).`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
