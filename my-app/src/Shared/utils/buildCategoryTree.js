export function buildCategoryTree(categories = []) {

  // 🔥 Prevent crashes
  if (!Array.isArray(categories)) {
    return [];
  }

  const map = {};
  const roots = [];

  // 🔥 Create map
  categories.forEach((cat) => {
    map[cat._id] = {
      ...cat,
      children: [],
    };
  });

  // 🔥 Build tree
  categories.forEach((cat) => {

    if (
      cat.parent &&
      map[cat.parent]
    ) {
      map[cat.parent].children.push(
        map[cat._id]
      );

    } else {
      roots.push(map[cat._id]);
    }
  });

  return roots;
}