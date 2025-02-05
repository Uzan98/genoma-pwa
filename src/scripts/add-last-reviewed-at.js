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

async function addLastReviewedAt() {
  try {
    console.log('Conectando ao banco de dados...');
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    // Verifica se a coluna lastReviewedAt existe
    const columnExists = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM sys.columns 
      WHERE Name = 'lastReviewedAt'
      AND Object_ID = Object_ID('Flashcard')
    `);

    if (columnExists.recordset[0].count === 0) {
      console.log('Adicionando a coluna lastReviewedAt...');
      
      await pool.request().query(`
        ALTER TABLE Flashcard
        ADD lastReviewedAt DATETIME NULL;
      `);

      console.log('Coluna lastReviewedAt adicionada com sucesso!');
    } else {
      console.log('A coluna lastReviewedAt já existe.');
    }

    await pool.close();
    console.log('Operação concluída com sucesso!');
  } catch (err) {
    console.error('Erro:', err);
  }
}

addLastReviewedAt(); 