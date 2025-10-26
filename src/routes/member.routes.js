const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, Address } = require("../models");

/**
 * @swagger
 * tags:
 *   name: Member
 *   description: Operações do membro logado
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

/**
 * @swagger
 * /member:
 *   get:
 *     summary: Obter detalhes do usuário logado
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 role:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Token inválido ou usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar usuário com endereços
    const user = await User.findByPk(userId, {
      include: [Address],
      attributes: { exclude: ['passwordHash'] } // Excluir senha da resposta
    });
    
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    res.json({
      message: "Perfil do usuário obtido com sucesso",
      user: user
    });
    
  } catch (error) {
    console.error("Erro ao obter perfil do usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * @swagger
 * /member/update-profile:
 *   put:
 *     summary: Atualizar perfil do usuário logado
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Dados para atualização do perfil
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/update-profile", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    // Atualizar apenas os campos fornecidos
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    
    await user.update(updateData);
    
    res.json({
      message: "Perfil atualizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * @swagger
 * /member:
 *   put:
 *     summary: Atualizar perfil do usuário logado
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Dados para atualização do perfil
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    // Atualizar apenas os campos fornecidos
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    
    await user.update(updateData);
    
    res.json({
      message: "Perfil atualizado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
