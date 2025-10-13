const express = require("express");
const router = express.Router();
const controller = require("../controllers/favorite.controller");

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Manage user favorite products
 */

/**
 * @swagger
 * /favorites/{userId}/{productId}:
 *   post:
 *     summary: Add a product to user's favorites
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product added to favorites
 *       404:
 *         description: User or product not found
 */
router.post("/:userId/:productId", controller.add);

module.exports = router;