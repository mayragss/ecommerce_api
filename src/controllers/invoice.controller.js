const { Cart, User } = require("../models");
const fs = require("fs");
const path = require("path");

module.exports = {
  async generateInvoice(req, res) {
    const { cartId } = req.params;
    const cart = await Cart.findByPk(cartId, { include: User });

    if (!cart) return res.status(404).json({ error: "Cart not found" });
    if (cart.paymentStatus !== 'paid') return res.status(400).json({ error: "Cart not paid" });

    const invoiceText = `Invoice\n\nCustomer: ${cart.User.name}\nTotal: $${cart.totalPrice}\nCurrency: ${cart.currency}\nPaid via: ${cart.paymentMethod}`;

    const fileName = `invoice-${cartId}.txt`;
    const filePath = path.join(__dirname, `../invoices/${fileName}`);
    fs.writeFileSync(filePath, invoiceText);

    const invoiceUrl = `/invoices/${fileName}`;
    cart.invoiceUrl = invoiceUrl;
    await cart.save();

    res.json({ invoiceUrl });
  },

  async downloadInvoice(req, res) {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, `../invoices/${fileName}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.download(filePath);
  }
};
