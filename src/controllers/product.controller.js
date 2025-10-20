const { Product } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  async create(req, res) {
    try {
      const { name, description, price, stock, category, collection, attributes } = req.body;

      const images = req.files?.map((file) => `/uploads/${file.filename}`) || [];

      const newProduct = await Product.create({
        name,
        description,
        price,
        stock,
        category,
        collection,
        attributes: attributes ? JSON.parse(attributes) : {},
        images
      });

      res.status(201).json(newProduct);
    } catch (err) {
      console.error("Erro ao criar produto:", err);
      res.status(500).json({ error: "Erro ao criar produto" });
    }
  },

  async getAllFiltered(req, res) {
    try {
      const { availability, minPrice, maxPrice, sort } = req.query;

      // Filtros
      const where = {};

      if (availability === "in-stock") where.stock = { [Op.gt]: 0 };
      if (availability === "out-of-stock") where.stock = 0;

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
      }

      // Ordenação
      let order = [];
      switch (sort) {
        case "name_asc":
          order.push(["name", "ASC"]);
          break;
        case "stock_desc":
          order.push(["stock", "DESC"]);
          break;
        default:
          order.push(["priority", "DESC"], ["createdAt", "DESC"]);
      }

      const products = await Product.findAll({ where, order });
      res.json(products);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  },

  async getAll(req, res) {
    try {
      let order = [];
      order.push(["priority", "DESC"], ["createdAt", "DESC"]);

      const products = await Product.findAll({ order });
      res.json(products);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  },


  async getById(req, res) {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  },

  async update(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const updateData = { ...req.body };

      // Processar imagens existentes e novas
      let finalImages = [];
      
      // Adicionar imagens existentes se fornecidas
      if (req.body.existingImages) {
        try {
          const existingImages = JSON.parse(req.body.existingImages);
          if (Array.isArray(existingImages)) {
            finalImages = [...existingImages];
          }
        } catch (err) {
          console.error("Erro ao processar imagens existentes:", err);
        }
      }
      
      // Adicionar novas imagens se houver arquivos enviados
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => `/uploads/${file.filename}`);
        finalImages = [...finalImages, ...newImages];
      }
      
      // Se não há imagens existentes nem novas, manter as atuais
      if (finalImages.length === 0 && product.images) {
        if (Array.isArray(product.images)) {
          finalImages = [...product.images];
        } else if (typeof product.images === 'string') {
          finalImages = [product.images];
        }
      }
      
      if (finalImages.length > 0) {
        updateData.images = finalImages;
      }

      await product.update(updateData);
      res.json(product);
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
      res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  },

  async delete(req, res) {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    await product.destroy();
    res.status(204).send();
  }
};