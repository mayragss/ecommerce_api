const { Order, OrderItem, Product, User } = require("../models");

module.exports = {
    async getAll(req, res) {
        try {
            const orders = await Order.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: OrderItem,
                        include: [{
                            model: Product,
                            attributes: ['id', 'name', 'price', 'images']
                        }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json(orders);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            res.status(500).json({ error: error.message });
        }
    },

    async getById(req, res) {
        try {
            const order = await Order.findByPk(req.params.id, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email', 'phone']
                    },
                    {
                        model: OrderItem,
                        include: [{
                            model: Product,
                            attributes: ['id', 'name', 'price', 'images', 'description']
                        }]
                    }
                ]
            });
            
            if (!order) {
                return res.status(404).json({ error: "Pedido não encontrado" });
            }
            
            res.json(order);
        } catch (error) {
            console.error("Erro ao buscar pedido:", error);
            res.status(500).json({ error: error.message });
        }
    },

    async create(req, res) {
        try {
            const { items, paymentMethod = 'credit_card' } = req.body;
            const userId = req.user.id; // ID do usuário vem do token
            
            // Validações
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: "Items são obrigatórios" });
            }
            
            // Verificar se o usuário existe
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }
            
            // Calcular total e validar produtos
            let total = 0;
            const orderItems = [];
            
            for (const item of items) {
                if (!item.productId || !item.quantity) {
                    return res.status(400).json({ error: "Cada item deve ter productId e quantity" });
                }
                
                const product = await Product.findByPk(item.productId);
                if (!product) {
                    return res.status(404).json({ error: `Produto ${item.productId} não encontrado` });
                }
                
                if (product.stock < item.quantity) {
                    return res.status(400).json({ error: `Estoque insuficiente para o produto ${product.name}` });
                }
                
                const itemTotal = product.price * item.quantity;
                total += itemTotal;
                
                orderItems.push({
                    ProductId: product.id,
                    quantity: item.quantity,
                    unitPrice: product.price
                });
            }
            
            // Criar pedido
            const order = await Order.create({ 
                UserId: userId,
                total: total,
                status: 'pending',
                paymentMethod: paymentMethod
            });
            
            // Criar itens do pedido
            for (const item of orderItems) {
                await OrderItem.create({
                    OrderId: order.id,
                    ProductId: item.ProductId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                });
                
                // Atualizar estoque do produto
                const product = await Product.findByPk(item.ProductId);
                await product.update({ stock: product.stock - item.quantity });
            }
            
            res.status(201).json({ 
                message: "Pedido criado com sucesso", 
                order: {
                    id: order.id,
                    total: order.total,
                    status: order.status,
                    paymentMethod: order.paymentMethod,
                    items: orderItems
                }
            });
            
        } catch (error) {
            console.error("Erro ao criar pedido:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
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