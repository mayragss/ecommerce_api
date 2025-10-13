const { Order, OrderItem, Product, User } = require("../models");

module.exports = {
    async create(req, res) {
        const { userId, items } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const order = await Order.create({ UserId: userId });

        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (product) {
                await OrderItem.create({
                    OrderId: order.id,
                    ProductId: product.id,
                    quantity: item.quantity,
                    price: product.price
                });
            }
        }

        res.status(201).json({ message: "Order created", orderId: order.id });
    },

    async getByUser(req, res) {
        const { userId } = req.params;
        const orders = await Order.findAll({
            where: { UserId: userId },
            include: {
                model: Product,
                through: { attributes: ["quantity", "price"] }
            }
        });
        res.json(orders);
    },

    async UpdateStatus(req, res) {
        const { status } = req.body;
        const validStatuses = ["processing", "shipped", "delivered", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid order status" });
        }

        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        order.status = status;
        await order.save();

        res.json({ message: "Order status updated", order });
    }
};