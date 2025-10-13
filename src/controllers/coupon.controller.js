const { Coupon } = require("../models");

exports.validateCoupon = async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ where: { code } });
  if (!coupon || new Date() > new Date(coupon.expiresAt)) return res.status(400).json({ error: "Invalid or expired" });
  res.json(coupon);
};

// ========================
// src/routes/coupon.routes.js
const router = require("express").Router();
const controller = require("../controllers/coupon.controller");

router.post("/validate", controller.validateCoupon);

module.exports = router;