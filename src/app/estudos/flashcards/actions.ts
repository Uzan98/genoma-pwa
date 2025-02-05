'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/db/drizzle';
import type { ApiResponse, Deck, Flashcard, FlashcardStats } from './types';
import * as mssql from 'mssql';
import { getPool } from '../../../db/mssql';
import { v4 as uuidv4 } from 'uuid';

export async function getDecksAction(): Promise<ApiResponse<Deck[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const result = await db.query<Deck>(`
      SELECT 
        d.*,
        COUNT(DISTINCT f.id) as totalCards,
        COUNT(DISTINCT CASE 
          WHEN f.nextReviewAt <= GETDATE() 
          THEN f.id 
          ELSE NULL 
        END) as cardsToReview
      FROM Deck d
      LEFT JOIN Flashcard f ON d.id = f.deckId
      WHERE d.userId = @P1
      GROUP BY d.id, d.userId, d.title, d.description, d.isPublic, d.createdAt, d.updatedAt
      ORDER BY d.updatedAt DESC
    `, [session.user.id]);

    return { success: true, data: result.recordset };
  } catch (error) {
    console.error('Erro ao buscar decks:', error);
    return { success: false, error: 'Erro ao buscar decks' };
  }
}

export async function getFlashcardStatsAction(): Promise<ApiResponse<FlashcardStats>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const result = await db.query<FlashcardStats>(`
      SELECT 
        COUNT(DISTINCT d.id) as totalDecks,
        COUNT(DISTINCT f.id) as totalCards,
        COUNT(DISTINCT CASE 
          WHEN f.nextReviewAt <= GETDATE() 
          THEN f.id 
          ELSE NULL 
        END) as cardsToReview,
        COUNT(DISTINCT CASE 
          WHEN fr.reviewedAt >= CAST(GETDATE() AS DATE)
          THEN fr.id 
          ELSE NULL 
        END) as cardsReviewedToday
      FROM Deck d
      LEFT JOIN Flashcard f ON d.id = f.deckId
      LEFT JOIN FlashcardReview fr ON f.id = fr.flashcardId
      WHERE d.userId = @P1
    `, [session.user.id]);

    return { success: true, data: result.recordset[0] };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { success: false, error: 'Erro ao buscar estatísticas' };
  }
}

interface CreateDeckParams {
  title: string;
  description: string;
  isPublic: boolean;
}

export async function createDeckAction(params: CreateDeckParams): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const pool = await db.getDb();
    const result = await pool.request()
      .input('userId', session.user.id)
      .input('title', params.title)
      .input('description', params.description)
      .input('isPublic', params.isPublic)
      .query<{ id: string }>(`
        DECLARE @NewId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO Deck (id, userId, title, description, isPublic, createdAt, updatedAt)
        VALUES (@NewId, @userId, @title, @description, @isPublic, GETDATE(), GETDATE());
        SELECT @NewId as id;
      `);

    revalidatePath('/estudos/flashcards');
    return { success: true, data: result.recordset[0] };
  } catch (error) {
    console.error('Erro ao criar deck:', error);
    return { success: false, error: 'Erro ao criar deck' };
  }
}

export async function getCardsToReviewAction(): Promise<ApiResponse<{ count: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const result = await db.query<{ count: number }>(`
      SELECT COUNT(DISTINCT f.id) as count
      FROM Deck d
      JOIN Flashcard f ON d.id = f.deckId
      WHERE d.userId = @P1
      AND f.nextReviewAt <= GETDATE()
    `, [session.user.id]);

    return { success: true, data: result.recordset[0] };
  } catch (error) {
    console.error('Erro ao buscar cards para revisar:', error);
    return { success: false, error: 'Erro ao buscar cards para revisar' };
  }
}

interface CreateFlashcardParams {
  deckId: string;
  front: string;
  back: string;
}

export async function createFlashcardAction(params: CreateFlashcardParams): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const pool = await db.getDb();
    
    // Verifica se o usuário tem acesso ao deck
    const deckResult = await pool.request()
      .input('deckId', params.deckId)
      .input('userId', session.user.id)
      .query<Deck>(`
        SELECT id FROM Deck 
        WHERE id = @deckId AND (userId = @userId OR isPublic = 1)
      `);

    if (!deckResult.recordset[0]) {
      return { success: false, error: 'Deck não encontrado ou sem permissão' };
    }

    const result = await pool.request()
      .input('deckId', params.deckId)
      .input('front', params.front)
      .input('back', params.back)
      .query<{ id: string }>(`
        DECLARE @NewId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO Flashcard (
          id, 
          deckId, 
          front, 
          back, 
          repetitions,
          nextReviewAt,
          createdAt,
          updatedAt
        )
        VALUES (
          @NewId,
          @deckId,
          @front,
          @back,
          0,
          GETDATE(),
          GETDATE(),
          GETDATE()
        );
        SELECT @NewId as id;
      `);

    revalidatePath(`/estudos/flashcards/${params.deckId}`);
    return { success: true, data: result.recordset[0] };
  } catch (error) {
    console.error('Erro ao criar flashcard:', error);
    return { success: false, error: 'Erro ao criar flashcard' };
  }
}

export async function getDeckAction(deckId: string): Promise<ApiResponse<Deck>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const result = await db.query<Deck>(`
      SELECT 
        d.*,
        COUNT(DISTINCT f.id) as totalCards,
        COUNT(DISTINCT CASE 
          WHEN f.nextReviewAt <= GETDATE() 
          THEN f.id 
          ELSE NULL 
        END) as cardsToReview
      FROM Deck d
      LEFT JOIN Flashcard f ON d.id = f.deckId
      WHERE d.userId = @P1
      AND d.id = @P2
      GROUP BY d.id, d.userId, d.title, d.description, d.isPublic, d.createdAt, d.updatedAt
    `, [session.user.id, deckId]);

    const deck = result.recordset[0];
    if (!deck) {
      return { success: false, error: 'Deck não encontrado' };
    }

    if (deck.userId !== session.user.id) {
      return { success: false, error: 'Você não tem permissão para acessar este deck' };
    }

    return { success: true, data: deck };
  } catch (error) {
    console.error('Erro ao buscar deck:', error);
    return { success: false, error: 'Erro ao buscar deck' };
  }
}

export async function getFlashcardsAction(deckId: string): Promise<ApiResponse<Flashcard[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const deckResult = await db.query<Deck>(`
      SELECT 
        d.*,
        COUNT(DISTINCT f.id) as totalCards,
        COUNT(DISTINCT CASE 
          WHEN f.nextReviewAt <= GETDATE() 
          THEN f.id 
          ELSE NULL 
        END) as cardsToReview
      FROM Deck d
      LEFT JOIN Flashcard f ON d.id = f.deckId
      WHERE d.userId = @P1
      AND d.id = @P2
      GROUP BY d.id, d.userId, d.title, d.description, d.isPublic, d.createdAt, d.updatedAt
    `, [session.user.id, deckId]);

    const deck = deckResult.recordset[0];
    if (!deck) {
      return { success: false, error: 'Deck não encontrado' };
    }

    if (deck.userId !== session.user.id) {
      return { success: false, error: 'Você não tem permissão para acessar este deck' };
    }

    const cardsResult = await db.query<Flashcard>(`
      SELECT f.*
      FROM Flashcard f
      JOIN Deck d ON f.deckId = d.id
      WHERE d.userId = @P1
      AND d.id = @P2
      ORDER BY f.nextReviewAt
    `, [session.user.id, deckId]);

    return { success: true, data: cardsResult.recordset };
  } catch (error) {
    console.error('Erro ao buscar flashcards:', error);
    return { success: false, error: 'Erro ao buscar flashcards' };
  }
}

export async function updateFlashcardProgressAction(flashcardId: string, quality: number): Promise<ApiResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const pool = await db.getDb();
    const request = pool.request();
    
    // Busca o flashcard
    const flashcardResult = await request
      .input('flashcardIdSelect', mssql.UniqueIdentifier, flashcardId)
      .query<Flashcard & { userId: string }>(`
        SELECT f.*, d.userId 
        FROM Flashcard f
        JOIN Deck d ON f.deckId = d.id
        WHERE f.id = @flashcardIdSelect
      `);

    const flashcard = flashcardResult.recordset[0];
    if (!flashcard) {
      return { success: false, error: 'Flashcard não encontrado' };
    }

    if (flashcard.userId !== session.user.id) {
      return { success: false, error: 'Você não tem permissão para atualizar este flashcard' };
    }

    // Implementação do algoritmo SM2 (SuperMemo 2)
    const now = new Date();
    let { repetitions = 0, easeFactor = 2.5, interval = 0 } = flashcard;

    // Qualidade da resposta deve estar entre 0 e 5
    quality = Math.max(0, Math.min(5, quality));

    // Se a qualidade for menor que 3, reinicia o processo
    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      // Atualiza o fator de facilidade
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      
      // Calcula o próximo intervalo
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      
      repetitions++;
    }

    // Calcula a próxima data de revisão
    const nextReviewAt = new Date(now);
    nextReviewAt.setDate(now.getDate() + interval);

    // Atualiza o flashcard
    await request
      .input('flashcardIdUpdate', mssql.UniqueIdentifier, flashcardId)
      .input('repetitionsUpdate', mssql.Int, repetitions)
      .input('easeFactorUpdate', mssql.Float, easeFactor)
      .input('intervalUpdate', mssql.Int, interval)
      .input('nextReviewAtUpdate', mssql.DateTime, nextReviewAt)
      .input('lastReviewedAtUpdate', mssql.DateTime, now)
      .query(`
        UPDATE Flashcard 
        SET repetitions = @repetitionsUpdate,
            easeFactor = @easeFactorUpdate,
            interval = @intervalUpdate,
            nextReviewAt = @nextReviewAtUpdate,
            lastReviewedAt = @lastReviewedAtUpdate,
            updatedAt = GETDATE()
        WHERE id = @flashcardIdUpdate
      `);

    // Registra a revisão
    await request
      .input('reviewIdInsert', mssql.UniqueIdentifier, uuidv4())
      .input('flashcardIdInsert', mssql.UniqueIdentifier, flashcardId)
      .input('userIdInsert', mssql.UniqueIdentifier, session.user.id)
      .input('qualityInsert', mssql.Int, quality)
      .input('reviewedAtInsert', mssql.DateTime, now)
      .query(`
        INSERT INTO FlashcardReview (id, flashcardId, userId, quality, reviewedAt)
        VALUES (@reviewIdInsert, @flashcardIdInsert, @userIdInsert, @qualityInsert, @reviewedAtInsert)
      `);

    // Revalidar o cache da página de estudo
    revalidatePath(`/estudos/flashcards/${flashcard.deckId}/study`);

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar progresso do flashcard:', error);
    return { success: false, error: 'Erro ao atualizar progresso do flashcard' };
  }
} 