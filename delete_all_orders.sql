-- Script para apagar todos os pedidos
-- IMPORTANTE: Este script irá deletar TODOS os pedidos e dados relacionados

-- Primeiro, deletar os comprovativos de pagamento (se a tabela existir)
DELETE FROM payment_proofs;

-- Deletar os itens dos pedidos
DELETE FROM order_items;

-- Deletar todos os pedidos
DELETE FROM orders;

-- Resetar o auto_increment (opcional - apenas se quiser que os próximos IDs comecem do 1)
-- ALTER TABLE orders AUTO_INCREMENT = 1;
-- ALTER TABLE order_items AUTO_INCREMENT = 1;
-- ALTER TABLE payment_proofs AUTO_INCREMENT = 1;


