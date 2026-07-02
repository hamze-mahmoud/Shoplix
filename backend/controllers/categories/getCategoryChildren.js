const Category = require("../../models/Category");

/**
 * Direct children of a category, each enriched with a resolved `image`:
 *   - the child's own image, otherwise
 *   - the image of its nearest descendant that has one (breadth-first).
 *
 * This keeps the sub-category cards illustrated even when a child has no
 * image of its own but a grandchild does.
 */
const getCategoryChildren = async (req, res) => {
  try {
    const { id } = req.params;
    const all = await Category.find().lean();

    // parentId -> [children]
    const childrenOf = new Map();
    for (const cat of all) {
      const key = cat.parent ? cat.parent.toString() : "root";
      if (!childrenOf.has(key)) childrenOf.set(key, []);
      childrenOf.get(key).push(cat);
    }

    const resolveImage = (cat) => {
      if (cat.image?.url) return cat.image;
      const queue = [...(childrenOf.get(cat._id.toString()) || [])];
      while (queue.length) {
        const node = queue.shift();
        if (node.image?.url) return node.image;
        queue.push(...(childrenOf.get(node._id.toString()) || []));
      }
      return null;
    };

    const children = (childrenOf.get(id) || []).map((cat) => ({
      ...cat,
      image: resolveImage(cat),
    }));

    res.json(children);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = getCategoryChildren;
