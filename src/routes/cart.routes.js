const express = require("express");
const router = express.Router();
const controller = require("../controllers/cart.controller");
/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart operations
 */


/**
 * @swagger
 * /cart/{userId}/add:
 *   post:
 *     summary: Add product(s) to user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to add to cart
 *     requestBody:
 *       description: Product(s) to add with quantities
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Product(s) added to cart
 *       400:
 *         description: Invalid input
 */
router.post("/:userId/add", controller.addToCart);

/**
 * @swagger
 * /cart/{userId}:
 *   get:
 *     summary: Get the current cart for a user
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's cart details
 *       404:
 *         description: Cart not found
 */
router.get("/:userId", controller.getCart);

/**
 * @swagger
 * /cart/{userId}:
 *   delete:
 *     summary: Clear the user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete("/:userId", controller.clearCart);

module.exports = router;