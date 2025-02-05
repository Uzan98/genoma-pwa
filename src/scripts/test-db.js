require('dotenv').config();
const sql = require('mssql');

const config = {
  server: 'genoma.database.windows.net',
  database: 'genoma study',
  authentication: {
    type: 'azure-active-directory-default',
    options: {
      clientId: process.env.AZURE_CLIENT_ID
    }
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    console.log('Usando Client ID:', process.env.AZURE_CLIENT_ID);
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');
    
    // Tenta fazer uma query simples
    const result = await pool.request().query('SELECT @@version');
    console.log('Versão do SQL Server:', result.recordset[0]);
    
    await pool.close();
    console.log('Conexão fechada.');
  } catch (err) {
    console.error('Erro ao conectar:', err);
  }
}

testConnection(); 