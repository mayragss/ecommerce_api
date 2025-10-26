const { User, Address } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  async create(req, res) {
    const user = await User.create(req.body);
    res.status(201).json(user);
  },

  async getAll(req, res) {
    const users = await User.findAll({ include: Address });
    res.json(users);
  },

  async getById(req, res) {
    const user = await User.findByPk(req.params.id, { include: Address });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  },

  async update(req, res) {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.update(req.body);
    res.json(user);
  },

  async delete(req, res) {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.destroy();
    res.status(204).send();
  },

  async register(req, res) {
    try {
      const { name, email, password, phone, address } = req.body;
      
      // Validações de entrada
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: "Nome, email e senha são obrigatórios",
          required: ["name", "email", "password"]
        });
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: "Formato de email inválido" 
        });
      }

      // Validação de senha (mínimo 6 caracteres)
      if (password.length < 6) {
        return res.status(400).json({ 
          error: "A senha deve ter pelo menos 6 caracteres" 
        });
      }

      // Verificar se o usuário já existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ 
          error: "Usuário já existe com este email" 
        });
      }

      // Hash da senha
      const saltRounds = 12;
      const hash = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        role: 'user', // Role padrão para novos usuários
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Adicionar telefone se fornecido
      if (phone) {
        userData.phone = phone.trim();
      }

      const user = await User.create(userData);

      // Criar endereço se fornecido
      if (address && Object.keys(address).length > 0) {
        const addressData = {
          userId: user.id,
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
          country: address.country || 'Portugal',
          isDefault: true
        };
        
        const { Address } = require("../models");
        await Address.create(addressData);
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          name: user.name
        }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      // Retornar dados do usuário (sem senha) e token
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        token
      };

      res.status(201).json({
        message: "Usuário registrado com sucesso",
        user: userResponse
      });

    } catch (err) {
      console.error("Registration error:", err);
      
      // Tratar erros específicos do Sequelize
      if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
          field: e.path,
          message: e.message
        }));
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: errors 
        });
      }

      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
          error: "Email já está em uso" 
        });
      }

      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validações de entrada
      if (!email || !password) {
        return res.status(400).json({ 
          error: "Email e senha são obrigatórios" 
        });
      }

      // Buscar usuário
      const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (!user) {
        return res.status(401).json({ 
          error: "Credenciais inválidas" 
        });
      }


      // Verificar senha
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ 
          error: "Credenciais inválidas" 
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          name: user.name
        }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      // Retornar dados do usuário (sem senha) e token
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: new Date()
      };

      res.json({
        message: "Login realizado com sucesso",
        user: userResponse,
        token
      });

    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ 
        error: "Erro interno do servidor",
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
      });
    }
  },

  async checkEmail(req, res) {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ 
          error: "Email é obrigatório" 
        });
      }

      const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      
      res.json({
        available: !user,
        message: user ? "Email já está em uso" : "Email disponível"
      });

    } catch (err) {
      console.error("Check email error:", err);
      res.status(500).json({ 
        error: "Erro interno do servidor" 
      });
    }
  }

};