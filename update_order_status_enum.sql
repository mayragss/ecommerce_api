-- Script para atualizar o ENUM de status dos pedidos incluindo "awaiting_treatment"
-- IMPORTANTE: Execute este script no banco de dados

-- Primeiro, vamos alterar todos os pedidos com status vazio para "pending"
UPDATE orders SET status = 'pending' WHERE status = '' OR status IS NULL;

-- Agora vamos alterar a coluna status para incluir o novo valor
ALTER TABLE orders 
MODIFY COLUMN status ENUM('pending', 'awaiting_treatment', 'paid', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending';

