const express = require("express");
const router = express.Router();
const dashboardCtrl = require("../controllers/Dashboard");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/stats", dashboardCtrl.getDashboardStats);
router.get("/sales", dashboardCtrl.getSalesAnalytics);
router.get("/orders", dashboardCtrl.getOrdersStats);

// Financial & profit reports (admin only)
router.get("/financial/summary", protect, admin, dashboardCtrl.getFinancialSummary);
router.get("/financial/trend", protect, admin, dashboardCtrl.getProfitTrend);

// Advanced analytics (admin only)
router.get("/analytics/categories", protect, admin, dashboardCtrl.getCategoryAnalytics);
router.get("/analytics/low-stock", protect, admin, dashboardCtrl.getLowStock);

module.exports = router;
