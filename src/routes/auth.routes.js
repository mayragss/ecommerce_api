const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models"); // ajuste conforme seu setup Sequelize

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e geração de tokens JWT
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login e geração de token JWT
 *     tags: [Auth]
 *     requestBody:
 *       description: Credenciais do usuário
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Token JWT gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT para autenticação
 *       400:
 *         description: Email ou senha inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log('login');
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Credenciais inválidas." });
    }
    
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(400).json({ error: "Credenciais inválidas." });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user', name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

module.exports = router;
