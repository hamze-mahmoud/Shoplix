const jwt = require("jsonwebtoken");
const { getSmartRecommendations } = require("../../services/recommendations");

// GET /api/products/recommendations/smart?limit=8&audience=kids|young|women|men|elderly
// Public. If a valid Bearer token happens to be present, the user id is passed
// through to the engine as the (future) personalization signal — soft auth,
// never rejects.
module.exports = async function getSmartRecommendationsCtrl(req, res) {
  try {
    let userId = null;
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      try {
        userId = jwt.verify(auth.slice(7), process.env.JWT_SECRET)?.id || null;
      } catch {
        userId = null; // expired/invalid token is fine for a public endpoint
      }
    }

    const { limit, audience } = req.query;
    const result = await getSmartRecommendations({ limit, audience, userId });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("getSmartRecommendations error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
