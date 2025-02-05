'use server';

import { query } from '@/lib/db';

async function createTables() {
  try {
    console.log('Iniciando criação das tabelas...');

    // Criar tabela Deck
    await query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Deck')
      BEGIN
        CREATE TABLE Deck (
          id NVARCHAR(255) PRIMARY KEY,
          userId NVARCHAR(255) NOT NULL,
          title NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          isPublic BIT DEFAULT 0,
          createdAt DATETIME DEFAULT GETDATE(),
          updatedAt DATETIME
        );

        CREATE INDEX IX_Deck_UserId ON Deck(userId);
      END
    `);
    console.log('Tabela Deck criada ou já existe');

    // Criar tabela Flashcard
    await query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Flashcard')
      BEGIN
        CREATE TABLE Flashcard (
          id NVARCHAR(255) PRIMARY KEY,
          deckId NVARCHAR(255) NOT NULL,
          front NVARCHAR(MAX) NOT NULL,
          back NVARCHAR(MAX) NOT NULL,
          difficulty INT DEFAULT 1,
          nextReviewDate DATETIME DEFAULT GETDATE(),
          lastReviewDate DATETIME,
          repetitions INT DEFAULT 0,
          createdAt DATETIME DEFAULT GETDATE(),
          updatedAt DATETIME,
          FOREIGN KEY (deckId) REFERENCES Deck(id) ON DELETE CASCADE
        );

        CREATE INDEX IX_Flashcard_DeckId ON Flashcard(deckId);
        CREATE INDEX IX_Flashcard_NextReview ON Flashcard(nextReviewDate);
      END
    `);
    console.log('Tabela Flashcard criada ou já existe');

    // Criar tabela FlashcardReview
    await query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FlashcardReview')
      BEGIN
        CREATE TABLE FlashcardReview (
          id NVARCHAR(255) PRIMARY KEY,
          flashcardId NVARCHAR(255) NOT NULL,
          userId NVARCHAR(255) NOT NULL,
          quality INT NOT NULL,
          reviewedAt DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (flashcardId) REFERENCES Flashcard(id) ON DELETE CASCADE
        );

        CREATE INDEX IX_FlashcardReview_UserId ON FlashcardReview(userId);
        CREATE INDEX IX_FlashcardReview_FlashcardId ON FlashcardReview(flashcardId);
      END
    `);
    console.log('Tabela FlashcardReview criada ou já existe');

    console.log('Todas as tabelas foram criadas com sucesso!');
    return true;
  } catch (err) {
    console.error('Erro ao criar tabelas:', err);
    return false;
  }
}

// Executa a criação das tabelas
createTables(); 