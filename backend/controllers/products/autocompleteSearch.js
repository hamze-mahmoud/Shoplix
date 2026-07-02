const Product = require("../../models/Product");

const autocompleteSearch = async (req, res) => {
    console.log("hello auto complete")

  try {
    const { keyword = "" } = req.query;

    if (!keyword.trim()) return res.json([]);

    const rx = { $regex: keyword.trim(), $options: "i" };

    // multilingual match: canonical + en/ar/he names
    const results = await Product.find({
      $or: [
        { name: rx },
        { "translations.en.name": rx },
        { "translations.ar.name": rx },
        { "translations.he.name": rx },
      ],
    })
      .select("name translations variants _id")
      .limit(6);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = autocompleteSearch;