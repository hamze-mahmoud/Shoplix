import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  TrendingUp,
  BarChart3,
  MessageSquareText,
  Images,
  Tags,
} from "lucide-react";

export const menu = [
  {
    name: "Dashboard",
    i18nKey: "admin.nav.dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },

  {
    name: "Analytics",
    i18nKey: "admin.nav.analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },

  {
    name: "Financial",
    i18nKey: "admin.nav.financial",
    path: "/admin/financial",
    icon: TrendingUp,
  },

  {
    name: "Products",
    i18nKey: "admin.nav.products",
    path: "/admin/products",
    icon: Package,
  },

  {
    name: "Categories",
    i18nKey: "admin.nav.categories",
    path: "/admin/categories",
    icon: FolderTree,
  },

  {
    name: "Orders",
    i18nKey: "admin.nav.orders",
    path: "/admin/orders",
    icon: ShoppingCart,
    badge: 12,
  },

  {
    name: "Users",
    i18nKey: "admin.nav.users",
    path: "/admin/users",
    icon: Users,
  },

  {
    name: "Reviews",
    i18nKey: "admin.nav.reviews",
    path: "/admin/reviews",
    icon: MessageSquareText,
  },

  {
    name: "Banners",
    i18nKey: "admin.nav.banners",
    path: "/admin/banners",
    icon: Images,
  },

  {
    name: "Offers",
    i18nKey: "admin.nav.offers",
    path: "/admin/offers",
    icon: Tags,
  },
];