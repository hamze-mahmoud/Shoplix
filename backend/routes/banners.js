const express = require("express");
const router = express.Router();
const bannersCtrl = require("../controllers/banners");

// Public — homepage hero slides
router.get("/", bannersCtrl.getActiveBanners);

module.exports = router;
