const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function updateEnum() {
  let connection;
  try {
    console.log('Conectando ao banco de dados...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Conectado ao banco de dados');
    
    // Atualizar status vazios para pending
    console.log('Atualizando status vazios...');
    const [updateResult] = await connection.query(
      "UPDATE orders SET status = 'pending' WHERE status = '' OR status IS NULL"
    );
    console.log(`✅ ${updateResult.affectedRows} pedidos atualizados`);
    
    // Atualizar o ENUM
    console.log('Atualizando ENUM da coluna status...');
    await connection.query(
      "ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'awaiting_treatment', 'paid', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending'"
    );
    console.log('✅ ENUM atualizado com sucesso!');
    
    await connection.end();
    console.log('✅ Concluído!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

updateEnum();


