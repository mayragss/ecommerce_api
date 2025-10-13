const { User, Product } = require("../models");

module.exports = {
  async add(req, res) {
    const user = await User.findByPk(req.params.userId);
    const product = await Product.findByPk(req.params.productId);
    await user.addFavorite(product);
    res.json({ success: true });
  }
};