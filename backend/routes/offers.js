const express = require("express");
const router = express.Router();
const offersCtrl = require("../controllers/offers");

// Public — live bundle offers only (active + within their date window)
router.get("/", offersCtrl.getActiveOffers);
router.get("/:id", offersCtrl.getOfferById);

module.exports = router;
