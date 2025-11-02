const express = require("express");
const router = express.Router();
const { Order, Product, User, Coupon, OrderItem } = require("../models");
const orderController = require("../controllers/order.controller");

// Estatísticas básicas
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalSales = await Order.sum('total') || 0;
    
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales: parseFloat(totalSales.toFixed(2))
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Estatísticas de vendas
router.get("/stats/sales", async (req, res) => {
  try {
    const sales = await Order.sum("total");
    res.json({ totalSales: sales || 0 });
  } catch (error) {
    console.error('Error getting sales:', error);
    res.status(500).json({ error: 'Erro ao obter vendas' });
  }
});

// Produtos mais vendidos
router.get("/stats/top-products", async (req, res) => {
  try {
    const products = await Product.findAll({ 
      order: [["sold", "DESC"]], 
      limit: 5 
    });
    res.json(products);
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({ error: 'Erro ao obter produtos' });
  }
});

// Dashboard completo
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalSales = await Order.sum('total') || 0;
    const totalCoupons = await Coupon.count();
    
    // Pedidos recentes
    const recentOrders = await Order.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    // Produtos mais vendidos
    const topProducts = await Product.findAll({
      order: [['sold', 'DESC']],
      limit: 5
    });
    
    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalCoupons
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ error: 'Erro ao obter dados do dashboard' });
  }
});

/**
 * @swagger
 * /admin/orders/by-user/{userId}:
 *   get:
 *     summary: Get all orders for a specific user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/orders/by-user/:userId", orderController.getByUser);

module.exports = router;