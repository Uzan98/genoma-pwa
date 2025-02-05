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

async function fixColumnName() {
  try {
    console.log('Conectando ao banco de dados...');
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    // Verifica se a coluna nextReviewDate existe
    const columnExists = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM sys.columns 
      WHERE Name = 'nextReviewDate'
      AND Object_ID = Object_ID('Flashcard')
    `);

    if (columnExists.recordset[0].count > 0) {
      console.log('Renomeando a coluna nextReviewDate para nextReviewAt...');
      
      // Renomeia a coluna
      await pool.request().query(`
        EXEC sp_rename 'Flashcard.nextReviewDate', 'nextReviewAt', 'COLUMN';
      `);

      console.log('Coluna renomeada com sucesso!');
    } else {
      console.log('A coluna nextReviewDate não existe. Verificando se nextReviewAt existe...');
      
      const newColumnExists = await pool.request().query(`
        SELECT COUNT(*) as count
        FROM sys.columns 
        WHERE Name = 'nextReviewAt'
        AND Object_ID = Object_ID('Flashcard')
      `);

      if (newColumnExists.recordset[0].count === 0) {
        console.log('Criando a coluna nextReviewAt...');
        
        await pool.request().query(`
          ALTER TABLE Flashcard
          ADD nextReviewAt DATETIME NOT NULL DEFAULT GETDATE();
        `);

        console.log('Coluna nextReviewAt criada com sucesso!');
      } else {
        console.log('A coluna nextReviewAt já existe.');
      }
    }

    await pool.close();
    console.log('Operação concluída com sucesso!');
  } catch (err) {
    console.error('Erro:', err);
  }
}

fixColumnName(); 