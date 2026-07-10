const Category = require("../../models/Category");
const { cache } = require("../../config/cache");

/**
 * Showcase list for the storefront home grid.
 *
 * Returns a flat list of every category (roots first, then sub-categories),
 * each enriched with a resolved `image.url`:
 *   - the category's own image if it has one, otherwise
 *   - the image of its nearest descendant that has one (breadth-first).
 *
 * This lets a parent category (which often has no image of its own) borrow
 * imagery from a child, so the grid is fully illustrated.
 */
const getCategoriesShowcase = async (req, res) => {
  try {
    const list = await cache.getOrSet("categories:showcase", 300, async () => {
      const all = await Category.find().lean();

      // parentId -> [children]
      const childrenOf = new Map();
      for (const cat of all) {
        const key = cat.parent ? cat.parent.toString() : "root";
        if (!childrenOf.has(key)) childrenOf.set(key, []);
        childrenOf.get(key).push(cat);
      }

      // Nearest descendant image (breadth-first), so the closest child wins.
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

      const roots = childrenOf.get("root") || [];
      const children = all.filter((c) => c.parent);
      // Roots lead the grid, sub-categories fill the rest.
      const ordered = [...roots, ...children];

      return ordered.map((cat) => ({
        _id: cat._id,
        name: cat.name,
        description: cat.description || "",
        translations: cat.translations,
        icon: cat.icon || "",
        isRoot: !cat.parent,
        image: resolveImage(cat),
      }));
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = getCategoriesShowcase;
