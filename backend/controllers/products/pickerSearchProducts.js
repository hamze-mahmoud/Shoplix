const Product = require("../../models/Product");
const { getPaginationParams, paginateAggregate } = require("../../utils/paginate");

// GET /api/admin/products/search?q=&page=&limit=
// Lightweight, server-side product picker for the bundle-offer admin. Returns
// only the fields the picker needs (name + each variant's id/label/price/
// stock/thumb) and is PAGINATED via aggregation so the browser never loads
// the whole catalog. Search is a case-insensitive name match.
module.exports = async function pickerSearchProducts(req, res) {
  try {
    const { q = "" } = req.query;
    const { page, limit } = getPaginationParams(req.query, { defaultLimit: 10, maxLimit: 25 });

    const term = String(q).trim();
    // Match the search term against the canonical name AND the localized
    // names (en/ar/he) so the admin can find a product by its Arabic or
    // Hebrew name, not just the default one.
    const rx = { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const match = term
      ? {
          $or: [
            { name: rx },
            { "translations.en.name": rx },
            { "translations.ar.name": rx },
            { "translations.he.name": rx },
          ],
        }
      : {};

    const { data, meta } = await paginateAggregate(
      Product,
      [
        { $match: match },
        {
          $project: {
            name: 1,
            // localized names so the picker can display the admin's language
            translations: { en: { name: 1 }, ar: { name: 1 }, he: { name: 1 } },
            variants: {
              $map: {
                input: "$variants",
                as: "v",
                in: {
                  _id: "$$v._id",
                  color: "$$v.color",
                  storage: "$$v.storage",
                  price: "$$v.price",
                  stock: "$$v.stock",
                  image: { $first: "$$v.images" },
                },
              },
            },
          },
        },
        { $sort: { name: 1 } },
      ],
      { page, limit }
    );

    res.json({ success: true, products: data, meta });
  } catch (err) {
    console.error("pickerSearchProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
