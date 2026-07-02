const express = require("express");
const router = express.Router();
const reviewsCtrl = require("../controllers/reviews");
const { protect } = require("../middleware/authMiddleware");

// Public — anyone can read a product's reviews
router.get("/product/:productId", reviewsCtrl.getProductReviews);

// Protected — must be logged in
router.use(protect);

router.get("/eligibility/:productId", reviewsCtrl.getEligibility);
router.post("/", reviewsCtrl.createReview);
router.put("/:id", reviewsCtrl.updateReview);
router.delete("/:id", reviewsCtrl.deleteReview);

module.exports = router;
