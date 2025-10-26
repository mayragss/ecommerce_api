-- =====================================================
-- INSERTS E ALTERAÇÕES PARA E-COMMERCE
-- =====================================================
-- Execute este script no MySQL da sua VPS
-- Este arquivo contém apenas INSERTs e ALTER TABLEs necessários

USE ecommerce_db;

-- =====================================================
-- ALTERAÇÕES DE TABELAS (se necessário)
-- =====================================================

-- Adicionar colunas que podem estar faltando
ALTER TABLE `Addresses` 
ADD COLUMN IF NOT EXISTS `zipCode` VARCHAR(255) DEFAULT NULL AFTER `zip`,
ADD COLUMN IF NOT EXISTS `country` VARCHAR(255) DEFAULT NULL AFTER `state`;

-- =====================================================
-- INSERTS DE DADOS ESSENCIAIS
-- =====================================================

-- Inserir usuário admin (se não existir)
INSERT IGNORE INTO `Users` (`name`, `email`, `passwordHash`, `phone`, `role`) VALUES
('Admin Principal', 'admin@ecommerce.com', 'admin123', '(11) 99999-9999', 'admin');

-- Inserir usuários de exemplo (se não existirem)
INSERT IGNORE INTO `Users` (`name`, `email`, `passwordHash`, `phone`, `role`) VALUES
('João Silva', 'joao@email.com', '123456', '(11) 88888-8888', 'user'),
('Maria Santos', 'maria@email.com', '123456', '(11) 77777-7777', 'user'),
('Pedro Costa', 'pedro@email.com', '123456', '(11) 66666-6666', 'user');

-- Inserir endereços de exemplo
INSERT IGNORE INTO `Addresses` (`UserId`, `street`, `city`, `state`, `zipCode`, `country`) VALUES
(2, 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'Brasil'),
(3, 'Av. Paulista, 456', 'São Paulo', 'SP', '01310-100', 'Brasil'),
(4, 'Rua Augusta, 789', 'São Paulo', 'SP', '01305-100', 'Brasil');

-- Inserir produtos de exemplo
INSERT IGNORE INTO `Products` (`name`, `description`, `price`, `stock`, `category`, `collection`, `attributes`, `images`, `sold`, `views`, `priority`) VALUES
('Camiseta Básica', 'Camiseta 100% algodão, confortável e durável', 29.90, 100, 'Roupas', 'Verão 2025', '{"size": ["P", "M", "G", "GG"], "color": ["Branco", "Preto", "Azul", "Vermelho"], "material": "100% Algodão"}', '["https://via.placeholder.com/300x300?text=Camiseta+Branca", "https://via.placeholder.com/300x300?text=Camiseta+Preta"]', 15, 120, 1),
('Calça Jeans', 'Calça jeans clássica, corte reto', 89.90, 50, 'Roupas', 'Verão 2025', '{"size": ["38", "40", "42", "44", "46"], "color": ["Azul", "Preto"], "material": "98% Algodão, 2% Elastano"}', '["https://via.placeholder.com/300x300?text=Calça+Jeans+Azul", "https://via.placeholder.com/300x300?text=Calça+Jeans+Preta"]', 8, 85, 2),
('Tênis Esportivo', 'Tênis confortável para atividades físicas', 199.90, 30, 'Calçados', 'Esportes', '{"size": ["36", "37", "38", "39", "40", "41", "42", "43", "44"], "color": ["Branco", "Preto", "Azul"], "material": "Mesh + Borracha"}', '["https://via.placeholder.com/300x300?text=Tênis+Branco", "https://via.placeholder.com/300x300?text=Tênis+Preto"]', 12, 200, 1),
('Bolsa de Couro', 'Bolsa de couro legítimo, elegante e durável', 299.90, 20, 'Acessórios', 'Inverno 2025', '{"color": ["Marrom", "Preto"], "material": "Couro Legítimo", "compartments": "3 compartimentos"}', '["https://via.placeholder.com/300x300?text=Bolsa+Marrom", "https://via.placeholder.com/300x300?text=Bolsa+Preta"]', 5, 60, 3),
('Relógio Digital', 'Relógio digital com múltiplas funções', 149.90, 40, 'Acessórios', 'Tecnologia', '{"color": ["Preto", "Prata"], "features": ["Cronômetro", "Alarme", "Resistente à água"], "battery": "Bateria de lítio"}', '["https://via.placeholder.com/300x300?text=Relógio+Preto", "https://via.placeholder.com/300x300?text=Relógio+Prata"]', 7, 90, 2);

-- Inserir cupons de exemplo
INSERT IGNORE INTO `coupons` (`code`, `type`, `value`, `expiresAt`, `usageLimit`, `usedCount`, `isActive`) VALUES
('WELCOME10', 'percentage', 10.00, DATE_ADD(NOW(), INTERVAL 30 DAY), 100, 5, 1),
('FREESHIP', 'fixed', 15.00, DATE_ADD(NOW(), INTERVAL 15 DAY), 50, 12, 1),
('SUMMER25', 'percentage', 25.00, DATE_ADD(NOW(), INTERVAL 60 DAY), 200, 0, 1),
('VIP50', 'fixed', 50.00, DATE_ADD(NOW(), INTERVAL 7 DAY), 10, 3, 1);

-- Inserir pedidos de exemplo
INSERT IGNORE INTO `Orders` (`UserId`, `total`, `status`, `paymentMethod`) VALUES
(2, 119.80, 'delivered', 'credit_card'),
(3, 289.80, 'shipped', 'pix'),
(4, 199.90, 'paid', 'credit_card'),
(2, 149.90, 'pending', 'pix');

-- Inserir itens dos pedidos
INSERT IGNORE INTO `OrderItems` (`OrderId`, `ProductId`, `quantity`, `unitPrice`) VALUES
(1, 1, 2, 29.90),
(1, 3, 1, 199.90),
(2, 2, 1, 89.90),
(2, 4, 1, 299.90),
(3, 3, 1, 199.90),
(4, 5, 1, 149.90);

-- Inserir carrinhos de exemplo
INSERT IGNORE INTO `Carts` (`UserId`, `totalItems`, `totalPrice`, `status`) VALUES
(2, 2, 59.80, 'active'),
(3, 1, 89.90, 'active'),
(4, 0, 0.00, 'active');

-- Inserir itens do carrinho
INSERT IGNORE INTO `CartItems` (`CartId`, `ProductId`, `quantity`) VALUES
(1, 1, 2),
(2, 2, 1);

-- Inserir favoritos de exemplo
INSERT IGNORE INTO `Favorites` (`UserId`, `ProductId`) VALUES
(2, 3),
(2, 5),
(3, 1),
(3, 4),
(4, 2);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Mostrar estatísticas
SELECT 'Usuários' as Tabela, COUNT(*) as Total FROM Users
UNION ALL
SELECT 'Produtos', COUNT(*) FROM Products
UNION ALL
SELECT 'Pedidos', COUNT(*) FROM Orders
UNION ALL
SELECT 'Cupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'Endereços', COUNT(*) FROM Addresses
UNION ALL
SELECT 'Carrinhos', COUNT(*) FROM Carts
UNION ALL
SELECT 'Favoritos', COUNT(*) FROM Favorites;

-- =====================================================
-- CREDENCIAIS DE ACESSO
-- =====================================================
-- Admin: admin@ecommerce.com / admin123
-- Usuários: joao@email.com, maria@email.com, pedro@email.com / 123456
-- =====================================================







