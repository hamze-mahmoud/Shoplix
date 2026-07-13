// Seed a demo product with 3 variants of different sizes (one oversized >2m)
// to showcase the conditional dimension display. --cleanup removes it.
// Usage: MONGODB_URI=... node scripts/seedDemoSizes.js [--cleanup]
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

const NAME = "Modular Display Shelf (demo)";

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/greenlight");

  if (process.argv.includes("--cleanup")) {
    const r = await Product.deleteOne({ name: NAME });
    console.log("deleted demo:", r.deletedCount);
    await mongoose.disconnect();
    return process.exit(0);
  }

  const category = await Category.findOne(); // any existing category
  await Product.deleteOne({ name: NAME }); // idempotent

  const p = await Product.create({
    name: NAME,
    description: "Demo product with small, medium and oversized variants.",
    translations: {
      en: { name: NAME, description: "Demo product with small, medium and oversized variants." },
      ar: { name: "رف عرض معياري (تجريبي)", description: "منتج تجريبي بمقاسات صغيرة ومتوسطة وكبيرة." },
      he: { name: "מדף תצוגה מודולרי (דמו)", description: "מוצר דמו בגדלים שונים." },
    },
    basePrice: 199,
    category: category?._id,
    isFeatured: false,
    variants: [
      { color: "Oak", translations: { en: { color: "Oak" }, ar: { color: "بلوط" }, he: { color: "אלון" } }, price: 199, costPrice: 120, stock: 10, widthCm: 40, heightCm: 60, images: [] },
      { color: "Walnut", translations: { en: { color: "Walnut" }, ar: { color: "جوز" }, he: { color: "אגוז" } }, price: 349, costPrice: 210, stock: 8, widthCm: 90, heightCm: 70, images: [] },
      { color: "Walnut XL", translations: { en: { color: "Walnut XL" }, ar: { color: "جوز XL" }, he: { color: "אגוז XL" } }, price: 899, costPrice: 540, stock: 3, widthCm: 220, heightCm: 180, images: [] },
    ],
  });
  console.log("seeded demo product:", p._id.toString());
  console.log("  variants: Oak 40×60 (normal) · Walnut 90×70 (normal) · Walnut XL 220×180 (OVERSIZED → shows dims)");
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
