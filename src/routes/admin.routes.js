const express = require("express");
const router = express.Router();
const { Order, Product } = require("../models");

router.get("/stats/sales", async (req, res) => {
  const sales = await Order.sum("totalPrice");
  res.json({ totalSales: sales });
});

router.get("/stats/top-products", async (req, res) => {
  const products = await Product.findAll({ order: [["views", "DESC"]], limit: 5 });
  res.json(products);
});

module.exports = router;