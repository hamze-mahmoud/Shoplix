export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};

export const PERMISSIONS = {
  EDIT_PRODUCT: [ROLES.ADMIN, ROLES.EDITOR],
  DELETE_PRODUCT: [ROLES.ADMIN],

  VIEW_ORDERS: [ROLES.ADMIN],
  EDIT_ORDERS: [ROLES.ADMIN],
  DELETE_ORDERS: [ROLES.ADMIN],

  VIEW_USERS: [ROLES.ADMIN],
  EDIT_USERS: [ROLES.ADMIN],
  DELETE_USERS: [ROLES.ADMIN],
};

// 🔥 Generic checker
export function hasPermission(user, permission) {
  if (!user || !user.role) return false;

  return PERMISSIONS[permission]?.includes(user.role);
}