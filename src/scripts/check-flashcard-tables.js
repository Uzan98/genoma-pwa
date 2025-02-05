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

async function checkTables() {
  try {
    console.log('Conectando ao banco de dados...');
    console.log('Usando Client ID:', process.env.AZURE_CLIENT_ID);
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    // Verifica se as tabelas existem
    const result = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME IN ('Deck', 'Flashcard', 'FlashcardReview')
    `);

    const existingTables = result.recordset.map(r => r.TABLE_NAME);
    console.log('\nTabelas encontradas:');
    console.log(existingTables);

    const requiredTables = ['Deck', 'Flashcard', 'FlashcardReview'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.log('\nTabelas faltando:');
      console.log(missingTables);
    } else {
      console.log('\nTodas as tabelas necessárias existem!');

      // Verifica a estrutura de cada tabela
      for (const table of requiredTables) {
        console.log(`\nEstrutura da tabela ${table}:`);
        const columns = await pool.request()
          .input('table', sql.VarChar, table)
          .query(`
            SELECT 
              COLUMN_NAME,
              DATA_TYPE,
              CHARACTER_MAXIMUM_LENGTH,
              IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @table
            ORDER BY ORDINAL_POSITION
          `);
        
        console.table(columns.recordset);
      }
    }

    await pool.close();
    console.log('\nConexão fechada.');
  } catch (err) {
    console.error('Erro:', err);
    // Mostra mais detalhes do erro
    if (err.code === 'ETIMEOUT') {
      console.error('Detalhes da conexão:', {
        server: config.server,
        database: config.database,
        clientId: process.env.AZURE_CLIENT_ID
      });
    }
  }
}

checkTables(); 