const express = require("express");
const router = express.Router();
const controller = require("../controllers/coupon.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Gerenciamento de cupons de desconto
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         code:
 *           type: string
 *           description: Código do cupom
 *         type:
 *           type: string
 *           enum: [fixed, percentage]
 *           description: Tipo do desconto
 *         value:
 *           type: number
 *           format: float
 *           description: Valor do desconto
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Data de expiração
 *         usageLimit:
 *           type: integer
 *           description: Limite de uso
 *         usedCount:
 *           type: integer
 *           description: Quantidade de vezes usado
 *         isActive:
 *           type: boolean
 *           description: Se o cupom está ativo
 */

/**
 * @swagger
 * /coupons:
 *   get:
 *     summary: Listar todos os cupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cupons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: Não autorizado
 */
router.get("/", authenticate, authorizeAdmin, controller.getAll);

/**
 * @swagger
 * /coupons/{id}:
 *   get:
 *     summary: Obter cupom pelo ID
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do cupom
 *     responses:
 *       200:
 *         description: Cupom encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
 *       404:
 *         description: Cupom não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:id", authenticate, authorizeAdmin, controller.getById);

/**
 * @swagger
 * /coupons:
 *   post:
 *     summary: Criar um novo cupom
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Dados do cupom
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       201:
 *         description: Cupom criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post("/", authenticate, authorizeAdmin, controller.create);

/**
 * @swagger
 * /coupons/{id}:
 *   put:
 *     summary: Atualizar um cupom
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do cupom a ser atualizado
 *     requestBody:
 *       description: Dados para atualizar
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       200:
 *         description: Cupom atualizado com sucesso
 *       404:
 *         description: Cupom não encontrado
 *       401:
 *         description: Não autorizado
 */
router.put("/:id", authenticate, authorizeAdmin, controller.update);

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     summary: Deletar um cupom
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do cupom a ser deletado
 *     responses:
 *       204:
 *         description: Cupom deletado com sucesso
 *       404:
 *         description: Cupom não encontrado
 *       401:
 *         description: Não autorizado
 */
router.delete("/:id", authenticate, authorizeAdmin, controller.delete);

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validar um cupom
 *     tags: [Coupons]
 *     requestBody:
 *       description: Código do cupom
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Código do cupom
 *     responses:
 *       200:
 *         description: Cupom válido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: Cupom inválido ou expirado
 */
router.post("/validate", controller.validateCoupon);

module.exports = router;






