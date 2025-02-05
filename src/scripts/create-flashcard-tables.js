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

async function createTables() {
  try {
    console.log('Conectando ao banco de dados...');
    console.log('Usando Client ID:', process.env.AZURE_CLIENT_ID);
    const pool = await sql.connect(config);
    console.log('Conexão estabelecida com sucesso!');

    console.log('\nCriando tabelas...');

    // Cria a tabela Deck
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Deck')
      BEGIN
        CREATE TABLE Deck (
          id NVARCHAR(255) PRIMARY KEY,
          userId NVARCHAR(255) NOT NULL,
          title NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          isPublic BIT NOT NULL DEFAULT 0,
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE()
        );

        CREATE INDEX IX_Deck_UserId ON Deck(userId);
      END
    `);
    console.log('Tabela Deck criada!');

    // Cria a tabela Flashcard
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Flashcard')
      BEGIN
        CREATE TABLE Flashcard (
          id NVARCHAR(255) PRIMARY KEY,
          deckId NVARCHAR(255) NOT NULL,
          front NVARCHAR(MAX) NOT NULL,
          back NVARCHAR(MAX) NOT NULL,
          difficulty INT NOT NULL DEFAULT 0,
          nextReviewAt DATETIME NOT NULL DEFAULT GETDATE(),
          lastReviewedAt DATETIME NULL,
          repetitions INT NOT NULL DEFAULT 0,
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (deckId) REFERENCES Deck(id) ON DELETE CASCADE
        );

        CREATE INDEX IX_Flashcard_DeckId ON Flashcard(deckId);
        CREATE INDEX IX_Flashcard_NextReview ON Flashcard(nextReviewAt);
      END
    `);
    console.log('Tabela Flashcard criada!');

    // Cria a tabela FlashcardReview
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FlashcardReview')
      BEGIN
        CREATE TABLE FlashcardReview (
          id NVARCHAR(255) PRIMARY KEY,
          flashcardId NVARCHAR(255) NOT NULL,
          userId NVARCHAR(255) NOT NULL,
          quality INT NOT NULL,
          reviewedAt DATETIME NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (flashcardId) REFERENCES Flashcard(id) ON DELETE CASCADE
        );

        CREATE INDEX IX_FlashcardReview_FlashcardId ON FlashcardReview(flashcardId);
        CREATE INDEX IX_FlashcardReview_UserId ON FlashcardReview(userId);
      END
    `);
    console.log('Tabela FlashcardReview criada!');

    await pool.close();
    console.log('\nTodas as tabelas foram criadas com sucesso!');
    console.log('Conexão fechada.');
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

createTables(); 