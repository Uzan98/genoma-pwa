require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.AZURE_SQL_HOST,
  database: process.env.AZURE_SQL_DATABASE,
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

async function createIndexes() {
  try {
    console.log('Conectando ao banco de dados...');
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    // Verifica se os índices já existem
    const checkIndexes = await pool.request().query(`
      SELECT name 
      FROM sys.indexes 
      WHERE name IN ('IX_Flashcard_NextReview_Composite', 'IX_FlashcardReview_Composite')
    `);

    if (checkIndexes.recordset.length === 0) {
      console.log('Criando índices...');
      
      // Cria índice para Flashcards
      await pool.request().query(`
        CREATE NONCLUSTERED INDEX IX_Flashcard_NextReview_Composite 
        ON Flashcard(nextReviewAt) 
        INCLUDE (deckId, front, back)
        WITH (ONLINE = ON);
      `);
      console.log('Índice de Flashcards criado!');

      // Cria índice para Reviews
      await pool.request().query(`
        CREATE NONCLUSTERED INDEX IX_FlashcardReview_Composite 
        ON FlashcardReview(flashcardId, userId) 
        INCLUDE (quality, reviewedAt)
        WITH (ONLINE = ON);
      `);
      console.log('Índice de Reviews criado!');

      // Atualiza estatísticas
      await pool.request().query(`
        UPDATE STATISTICS Flashcard WITH FULLSCAN;
        UPDATE STATISTICS FlashcardReview WITH FULLSCAN;
      `);
      console.log('Estatísticas atualizadas!');
    } else {
      console.log('Os índices já existem!');
    }

    await pool.close();
    console.log('Operação concluída com sucesso!');
  } catch (err) {
    console.error('Erro:', err);
  }
}

createIndexes(); 