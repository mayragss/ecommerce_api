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
      const { name, email, password } = req.body;
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hash });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ error: "User not found" });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Invalid credentials" });
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

};