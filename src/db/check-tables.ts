'use server';

import { query } from '@/lib/db';

async function checkTables() {
  try {
    console.log('Verificando tabelas existentes...');

    const result = await query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      AND TABLE_CATALOG = 'genoma study'
    `);

    const tables = result.map((row: any) => row.TABLE_NAME);
    console.log('Tabelas encontradas:', tables);

    const requiredTables = ['Deck', 'Flashcard', 'FlashcardReview'];
    const missingTables = requiredTables.filter(table => !tables.includes(table));

    if (missingTables.length > 0) {
      console.log('Tabelas faltando:', missingTables);
      return false;
    }

    console.log('Todas as tabelas necessárias existem!');
    return true;
  } catch (err) {
    console.error('Erro ao verificar tabelas:', err);
    return false;
  }
}

// Executa a verificação
checkTables(); 