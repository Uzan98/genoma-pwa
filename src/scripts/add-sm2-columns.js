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

async function addSM2Columns() {
  try {
    console.log('Conectando ao banco de dados...');
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    // Adiciona a coluna easeFactor se não existir
    const easeFactorExists = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM sys.columns 
      WHERE Name = 'easeFactor'
      AND Object_ID = Object_ID('Flashcard')
    `);

    if (easeFactorExists.recordset[0].count === 0) {
      console.log('Adicionando a coluna easeFactor...');
      await pool.request().query(`
        ALTER TABLE Flashcard
        ADD easeFactor FLOAT NOT NULL DEFAULT 2.5;
      `);
      console.log('Coluna easeFactor adicionada com sucesso!');
    }

    // Adiciona a coluna interval se não existir
    const intervalExists = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM sys.columns 
      WHERE Name = 'interval'
      AND Object_ID = Object_ID('Flashcard')
    `);

    if (intervalExists.recordset[0].count === 0) {
      console.log('Adicionando a coluna interval...');
      await pool.request().query(`
        ALTER TABLE Flashcard
        ADD interval INT NOT NULL DEFAULT 0;
      `);
      console.log('Coluna interval adicionada com sucesso!');
    }

    await pool.close();
    console.log('Operação concluída com sucesso!');
  } catch (err) {
    console.error('Erro:', err);
  }
}

addSM2Columns(); 