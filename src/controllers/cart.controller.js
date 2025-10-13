const { Cart, Product, CartItem, User } = require("../models");

module.exports = {
  async addToCart(req, res) {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let cart = await Cart.findOne({ where: { UserId: userId, status: 'active' } });
    if (!cart) cart = await Cart.create({ UserId: userId });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const [item, created] = await CartItem.findOrCreate({
      where: { CartId: cart.id, ProductId: productId },
      defaults: { quantity }
    });

    if (!created) {
      item.quantity += quantity;
      await item.save();
    }

    cart.totalItems += quantity;
    cart.totalPrice += product.price * quantity;
    cart.lastActivityAt = new Date();
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Item added to cart" });
  },

  async getCart(req, res) {
    const { userId } = req.params;
    const cart = await Cart.findOne({
      where: { UserId: userId, status: 'active' },
      include: {
        model: Product,
        through: { attributes: ["quantity"] }
      }
    });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json(cart);
  },

  async clearCart(req, res) {
    const { userId } = req.params;
    const cart = await Cart.findOne({ where: { UserId: userId, status: 'active' } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    await CartItem.destroy({ where: { CartId: cart.id } });
    cart.totalItems = 0;
    cart.totalPrice = 0.0;
    cart.lastActivityAt = new Date();
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Cart cleared" });
  },

  async checkoutCart(req, res) {
    const { userId } = req.params;
    const cart = await Cart.findOne({ where: { UserId: userId, status: 'active' }, include: Product });
    if (!cart) return res.status(404).json({ error: "Active cart not found" });
    if (cart.totalItems === 0) return res.status(400).json({ error: "Cart is empty" });

    // In a real system, integrate with a payment provider here
    // For now, we simulate payment success

    cart.status = 'ordered';
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Cart checked out successfully. Payment processed.", cart });
  }
};