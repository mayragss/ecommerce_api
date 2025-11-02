const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List all orders (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, authorizeAdmin, controller.getAll);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       description: Order details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreate'
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Invalid input
 */
router.post("/", authenticate, controller.create);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Get all orders for authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 */
router.get("/my-orders", authenticate, controller.getMyOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authenticate, authorizeAdmin, controller.getById);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       description: New status value
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 */
router.put("/:id/status", authenticate, authorizeAdmin, controller.UpdateStatus);

/**
 * @swagger
 * /orders/awaiting-treatment:
 *   post:
 *     summary: Set order to awaiting treatment (client action via WhatsApp)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Order ID
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Forbidden
 *       401:
 *         description: Unauthorized
 */
router.post("/awaiting-treatment", authenticate, controller.setAwaitingTreatment);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order by ID (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.delete("/:id", authenticate, authorizeAdmin, controller.delete);

module.exports = router;