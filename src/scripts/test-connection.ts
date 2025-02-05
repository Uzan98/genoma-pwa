import { getConnection } from '../lib/db';

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    const pool = await getConnection();
    console.log('Conexão estabelecida com sucesso!');
    
    // Tenta fazer uma query simples
    const request = pool.request();
    const result = await request.query('SELECT @@version');
    console.log('Versão do SQL Server:', result.recordset[0]);
    
    await pool.close();
    console.log('Conexão fechada.');
  } catch (err) {
    console.error('Erro ao conectar:', err);
  }
}

testConnection(); 