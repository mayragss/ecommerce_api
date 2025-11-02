const { Order, OrderItem, Product, User, sequelize } = require("../models");

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
            
            // Corrigir pedidos com status vazio ou inválido
            const validStatuses = ["pending", "awaiting_treatment", "paid", "shipped", "delivered", "cancelled"];
            for (const order of orders) {
                if (!order.status || order.status === '' || !validStatuses.includes(order.status)) {
                    order.status = 'pending';
                    await order.save();
                }
            }
            
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
        const transaction = await sequelize.transaction();
        
        try {
            const { items, paymentMethod = 'credit_card' } = req.body;
            const userId = req.user.id; // ID do usuário vem do token
            
            // Validações
            if (!items || !Array.isArray(items) || items.length === 0) {
                await transaction.rollback();
                return res.status(400).json({ error: "Items são obrigatórios" });
            }
            
            // Verificar se o usuário existe
            const user = await User.findByPk(userId, { transaction });
            if (!user) {
                await transaction.rollback();
                return res.status(404).json({ error: "Usuário não encontrado" });
            }
            
            // Calcular total e validar produtos
            let total = 0;
            const orderItems = [];
            
            for (const item of items) {
                if (!item.productId || !item.quantity) {
                    await transaction.rollback();
                    return res.status(400).json({ error: "Cada item deve ter productId e quantity" });
                }
                
                const product = await Product.findByPk(item.productId, { transaction });
                if (!product) {
                    await transaction.rollback();
                    return res.status(404).json({ error: `Produto ${item.productId} não encontrado` });
                }
                
                if (product.stock < item.quantity) {
                    await transaction.rollback();
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
            
            // Criar pedido com transação
            const order = await Order.create({ 
                UserId: userId,
                total: total,
                status: 'pending',
                paymentMethod: paymentMethod
            }, { transaction });
            
            // Criar itens do pedido com transação
            for (const item of orderItems) {
                await OrderItem.create({
                    OrderId: order.id,
                    ProductId: item.ProductId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }, { transaction });
                
                // Atualizar estoque do produto com transação
                const product = await Product.findByPk(item.ProductId, { transaction });
                await product.update({ stock: product.stock - item.quantity }, { transaction });
            }
            
            // Commit da transação
            await transaction.commit();
            
            // Buscar o pedido completo para retornar
            const createdOrder = await Order.findByPk(order.id, {
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
                ]
            });
            
            res.status(201).json(createdOrder);
            
        } catch (error) {
            // Rollback em caso de erro
            await transaction.rollback();
            console.error("Erro ao criar pedido:", error);
            res.status(500).json({ error: error.message || "Erro interno do servidor" });
        }
    },

    async getByUser(req, res) {
        try {
            const { userId } = req.params;
            const orders = await Order.findAll({
                where: { UserId: userId },
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
            console.error("Erro ao buscar pedidos do usuário:", error);
            res.status(500).json({ error: error.message });
        }
    },

    async getMyOrders(req, res) {
        try {
            const userId = req.user.id; // Pega o userId do token JWT
            
            const orders = await Order.findAll({
                where: { UserId: userId },
                include: [
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
            
            // Corrigir pedidos com status vazio ou inválido
            const validStatuses = ["pending", "awaiting_treatment", "paid", "shipped", "delivered", "cancelled"];
            for (const order of orders) {
                if (!order.status || order.status === '' || !validStatuses.includes(order.status)) {
                    order.status = 'pending';
                    await order.save();
                }
            }
            
            res.json(orders);
        } catch (error) {
            console.error("Erro ao buscar pedidos do usuário:", error);
            res.status(500).json({ error: error.message });
        }
    },

    async UpdateStatus(req, res) {
        try {
            const { status } = req.body;
            const validStatuses = ["pending", "awaiting_treatment", "paid", "shipped", "delivered", "cancelled"];

            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid order status" });
            }

            const order = await Order.findByPk(req.params.id);
            if (!order) return res.status(404).json({ error: "Order not found" });

            // Corrigir status vazio ou inválido do pedido atual (antes de verificar regras)
            const currentStatus = (!order.status || order.status === '' || !validStatuses.includes(order.status)) 
                ? 'pending' 
                : order.status;

            // Se o pedido está em "awaiting_treatment", só admin pode alterar
            if (currentStatus === "awaiting_treatment" && req.user.role !== 'admin') {
                return res.status(403).json({ error: "Only admin can change status from 'awaiting treatment'" });
            }

            // Aplicar o novo status diretamente
            console.log(`Atualizando pedido ${order.id} de status "${order.status}" para "${status}"`);
            order.status = status;
            await order.save();
            console.log(`Pedido ${order.id} atualizado com sucesso. Status atual: "${order.status}"`);

            // Buscar pedido completo para retornar
            const updatedOrder = await Order.findByPk(order.id, {
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
                ]
            });

            res.json({ message: "Order status updated", order: updatedOrder });
        } catch (error) {
            console.error("Erro ao atualizar status do pedido:", error);
            res.status(500).json({ error: error.message });
        }
    },

    async setAwaitingTreatment(req, res) {
        try {
            const userId = req.user.id; // ID do usuário autenticado
            const { orderId } = req.body;

            if (!orderId) {
                return res.status(400).json({ error: "Order ID is required" });
            }

            const order = await Order.findByPk(orderId);
            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }

            // Verificar se o pedido pertence ao usuário
            if (order.UserId !== userId) {
                return res.status(403).json({ error: "You don't have permission to modify this order" });
            }

            // Verificar se o pedido está em pending
            if (order.status !== "pending") {
                return res.status(400).json({ error: "Order can only be set to 'awaiting treatment' from 'pending' status" });
            }

            order.status = "awaiting_treatment";
            await order.save();

            // Buscar pedido completo para retornar
            const updatedOrder = await Order.findByPk(order.id, {
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
                ]
            });

            res.json({ message: "Order status updated to awaiting treatment", order: updatedOrder });
        } catch (error) {
            console.error("Erro ao definir pedido como aguardando tratamento:", error);
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        const transaction = await sequelize.transaction();
        
        try {
            const orderId = req.params.id;
            
            const order = await Order.findByPk(orderId, {
                include: [{ model: OrderItem }],
                transaction
            });
            
            if (!order) {
                await transaction.rollback();
                return res.status(404).json({ error: "Pedido não encontrado" });
            }
            
            // Deletar todos os itens do pedido primeiro
            await OrderItem.destroy({
                where: { OrderId: orderId },
                transaction
            });
            
            // Deletar o pedido
            await order.destroy({ transaction });
            
            // Commit da transação
            await transaction.commit();
            
            res.status(200).json({ message: "Pedido deletado com sucesso" });
        } catch (error) {
            // Rollback em caso de erro
            await transaction.rollback();
            console.error("Erro ao deletar pedido:", error);
            res.status(500).json({ error: error.message || "Erro interno do servidor" });
        }
    }
};