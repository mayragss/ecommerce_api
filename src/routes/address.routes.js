const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Address } = require("../models");

/**
 * @swagger
 * tags:
 *   name: Address
 *   description: Gerenciamento de endereços do usuário
 */

// Middleware para autenticação
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token de acesso necessário" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Middleware para autorização (apenas o próprio usuário ou admin)
const authorizeUserOrAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Admin pode fazer qualquer coisa
    if (userRole === 'admin') {
      return next();
    }
    
    // Para operações específicas de endereço, verificar se é o próprio usuário
    const addressId = req.params.id;
    if (addressId) {
      const address = await Address.findByPk(addressId);
      if (!address) {
        return res.status(404).json({ error: "Endereço não encontrado" });
      }
      
      if (address.UserId !== userId) {
        return res.status(403).json({ error: "Acesso negado. Você só pode gerenciar seus próprios endereços." });
      }
    }
    
    next();
  } catch (error) {
    console.error("Erro na autorização:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

/**
 * @swagger
 * /address:
 *   get:
 *     summary: Listar endereços do usuário logado
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de endereços retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       street:
 *                         type: string
 *                       number:
 *                         type: string
 *                       district:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zip:
 *                         type: string
 *                       complement:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [residential, commercial]
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const addresses = await Address.findAll({
      where: { UserId: userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      message: "Endereços obtidos com sucesso",
      addresses: addresses
    });
    
  } catch (error) {
    console.error("Erro ao obter endereços:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * @swagger
 * /address:
 *   post:
 *     summary: Criar novo endereço para o usuário logado
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Dados do endereço
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - state
 *               - zip
 *             properties:
 *               street:
 *                 type: string
 *               number:
 *                 type: string
 *               district:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *               complement:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [residential, commercial]
 *                 default: residential
 *     responses:
 *       201:
 *         description: Endereço criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, number, district, city, state, zip, complement, type = 'residential' } = req.body;
    
    // Validações obrigatórias
    if (!street || !city || !state || !zip) {
      return res.status(400).json({ 
        error: "Campos obrigatórios: street, city, state, zip" 
      });
    }
    
    const addressData = {
      UserId: userId,
      street: street.trim(),
      number: number ? number.trim() : null,
      district: district ? district.trim() : null,
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      complement: complement ? complement.trim() : null,
      type: type
    };
    
    const address = await Address.create(addressData);
    
    res.status(201).json({
      message: "Endereço criado com sucesso",
      address: address
    });
    
  } catch (error) {
    console.error("Erro ao criar endereço:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * @swagger
 * /address/{id}:
 *   put:
 *     summary: Atualizar endereço específico
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID do endereço
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Dados para atualização do endereço
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               number:
 *                 type: string
 *               district:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *               complement:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [residential, commercial]
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Endereço não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/:id", authenticate, authorizeUserOrAdmin, async (req, res) => {
  try {
    const addressId = req.params.id;
    const { street, number, district, city, state, zip, complement, type } = req.body;
    
    const address = await Address.findByPk(addressId);
    if (!address) {
      return res.status(404).json({ error: "Endereço não encontrado" });
    }
    
    // Atualizar apenas os campos fornecidos
    const updateData = {};
    if (street) updateData.street = street.trim();
    if (number !== undefined) updateData.number = number ? number.trim() : null;
    if (district !== undefined) updateData.district = district ? district.trim() : null;
    if (city) updateData.city = city.trim();
    if (state) updateData.state = state.trim();
    if (zip) updateData.zip = zip.trim();
    if (complement !== undefined) updateData.complement = complement ? complement.trim() : null;
    if (type) updateData.type = type;
    
    await address.update(updateData);
    
    res.json({
      message: "Endereço atualizado com sucesso",
      address: address
    });
    
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * @swagger
 * /address/{id}:
 *   delete:
 *     summary: Deletar endereço específico
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID do endereço
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Endereço deletado com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Endereço não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/:id", authenticate, authorizeUserOrAdmin, async (req, res) => {
  try {
    const addressId = req.params.id;
    
    const address = await Address.findByPk(addressId);
    if (!address) {
      return res.status(404).json({ error: "Endereço não encontrado" });
    }
    
    await address.destroy();
    
    res.json({
      message: "Endereço deletado com sucesso"
    });
    
  } catch (error) {
    console.error("Erro ao deletar endereço:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * @swagger
 * /address/{id}:
 *   get:
 *     summary: Obter endereço específico
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID do endereço
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Endereço obtido com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Endereço não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", authenticate, authorizeUserOrAdmin, async (req, res) => {
  try {
    const addressId = req.params.id;
    
    const address = await Address.findByPk(addressId);
    if (!address) {
      return res.status(404).json({ error: "Endereço não encontrado" });
    }
    
    res.json({
      message: "Endereço obtido com sucesso",
      address: address
    });
    
  } catch (error) {
    console.error("Erro ao obter endereço:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
