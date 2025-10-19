const { Coupon } = require("../models");

module.exports = {
  async getAll(req, res) {
    try {
      const coupons = await Coupon.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      if (!coupon) {
        return res.status(404).json({ error: "Cupom não encontrado" });
      }
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const coupon = await Coupon.create(req.body);
      res.status(201).json(coupon);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      if (!coupon) {
        return res.status(404).json({ error: "Cupom não encontrado" });
      }
      
      await coupon.update(req.body);
      res.json(coupon);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      if (!coupon) {
        return res.status(404).json({ error: "Cupom não encontrado" });
      }
      
      await coupon.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async validateCoupon(req, res) {
    try {
      const { code } = req.body;
      const coupon = await Coupon.findOne({ where: { code } });
      
      if (!coupon) {
        return res.status(400).json({ error: "Cupom não encontrado" });
      }
      
      if (!coupon.isActive) {
        return res.status(400).json({ error: "Cupom inativo" });
      }
      
      if (new Date() > new Date(coupon.expiresAt)) {
        return res.status(400).json({ error: "Cupom expirado" });
      }
      
      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ error: "Cupom esgotado" });
      }
      
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};