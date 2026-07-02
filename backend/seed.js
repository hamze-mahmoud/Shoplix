require("dotenv").config();

const mongoose = require("mongoose");
const Category = require("./models/Category");
const Product = require("./models/Product");

const categories = [
  {
    name: "Electronics",
    description: "Phones, laptops, and everyday tech",
    icon: "💻",
  },
  {
    name: "Wearables",
    description: "Smart watches and fitness gear",
    icon: "⌚",
  },
  {
    name: "Audio",
    description: "Headphones and sound accessories",
    icon: "🎧",
  },
];

const products = [
  {
    name: "Nova Pro Headphones",
    description: "Wireless over-ear headphones with active noise cancellation.",
    basePrice: 149,
    categoryName: "Audio",
    isFeatured: true,
    variants: [
      {
        color: "Black",
        storage: "Standard",
        price: 149,
        stock: 18,
        images: [
          "https://images.unsplash.com/photo-1518441902117-f0c0d5f0c0a6?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        color: "Silver",
        storage: "Standard",
        price: 159,
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
  },
  {
    name: "Galaxy Breeze Watch",
    description: "Lightweight smartwatch with health tracking and long battery life.",
    basePrice: 129,
    categoryName: "Wearables",
    isFeatured: true,
    variants: [
      {
        color: "Black",
        storage: "42mm",
        price: 129,
        stock: 20,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        color: "White",
        storage: "44mm",
        price: 139,
        stock: 14,
        images: [
          "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
  },
  {
    name: "Aurora Laptop",
    description: "A slim laptop for work, study, and streaming on the go.",
    basePrice: 899,
    categoryName: "Electronics",
    isFeatured: true,
    variants: [
      {
        color: "Space Gray",
        storage: "512GB",
        price: 899,
        stock: 9,
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        color: "Silver",
        storage: "1TB",
        price: 1099,
        stock: 6,
        images: [
          "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
  },
  {
    name: "Pulse Mini Speaker",
    description: "Portable Bluetooth speaker with rich sound and compact size.",
    basePrice: 59,
    categoryName: "Audio",
    isFeatured: false,
    variants: [
      {
        color: "Blue",
        storage: "Standard",
        price: 59,
        stock: 25,
        images: [
          "https://images.unsplash.com/photo-1512578659170-25f1a5f7d9f7?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
  },
];

async function upsertCategory(data, parent = null) {
  return Category.findOneAndUpdate(
    { name: data.name },
    {
      $setOnInsert: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        parent,
      },
    },
    { upsert: true, new: true }
  );
}

async function upsertProduct(data, categoryId) {
  return Product.findOneAndUpdate(
    { name: data.name },
    {
      $setOnInsert: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        category: categoryId,
        variants: data.variants,
        isFeatured: data.isFeatured,
      },
    },
    { upsert: true, new: true }
  );
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const categoryDocs = {};
  for (const category of categories) {
    categoryDocs[category.name] = await upsertCategory(category);
  }

  for (const product of products) {
    await upsertProduct(product, categoryDocs[product.categoryName]._id);
  }

  const productCount = await Product.countDocuments();
  const categoryCount = await Category.countDocuments();

  console.log(`Seed complete: ${categoryCount} categories, ${productCount} products.`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});