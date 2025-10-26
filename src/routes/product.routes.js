const router = require("express").Router();
const controller = require("../controllers/product.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload.middleware");
const multer = require("multer");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gerenciamento de produtos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         stock:
 *           type: integer
 *         category:
 *           type: string
 *         collection:
 *           type: string
 *         attributes:
 *           type: object
 *           description: Atributos customizados do produto
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         sold:
 *           type: integer
 *         views:
 *           type: integer
 *       example:
 *         id: 1
 *         name: "Camiseta Azul"
 *         description: "Camiseta 100% algodão"
 *         price: 49.9
 *         stock: 100
 *         category: "Roupas"
 *         collection: "Verão 2025"
 *         attributes: {"size": "M", "material": "algodão"}
 *         images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         sold: 10
 *         views: 100
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar todos os produtos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obter produto pelo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Criar um novo produto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Dados do produto
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       401:
 *         description: Não autorizado
 */
router.post("/", authenticate, authorizeAdmin, upload.array("images", 5), (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 5MB por arquivo.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Muitos arquivos. Máximo 5 imagens.' });
    }
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}, controller.create);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualizar um produto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto a ser atualizado
 *     requestBody:
 *       description: Dados para atualizar
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Produto não encontrado
 */
router.put("/:id", authenticate, authorizeAdmin, upload.array("images", 5), (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 5MB por arquivo.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Muitos arquivos. Máximo 5 imagens.' });
    }
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}, controller.update);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Deletar um produto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto a ser deletado
 *     responses:
 *       204:
 *         description: Produto deletado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Produto não encontrado
 */
router.delete("/:id", authenticate, authorizeAdmin, controller.delete);

module.exports = router;