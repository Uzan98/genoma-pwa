'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/db/drizzle';
import type { ApiResponse, Deck, Flashcard, FlashcardStats, SqlQueryResult } from '../types';
import type { IRecordSet } from 'mssql';
import * as mssql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

interface DeckRecord extends Deck {
  totalCards: number;
  cardsToReview: number;
}

interface IdRecord {
  id: string;
}

export async function getDecksAction(): Promise<ApiResponse<Deck[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const pool = await db.getDb();
    const request = pool.request();

    // Usa subqueries para melhor performance
    const result = await request
      .input('userId', session.user.id)
      .query(`
        SELECT 
          d.*,
          (
            SELECT COUNT(*) 
            FROM Flashcard f 
            WHERE f.deckId = d.id
          ) as totalCards,
          (
            SELECT COUNT(*) 
            FROM Flashcard f 
            WHERE f.deckId = d.id 
            AND f.nextReviewAt <= GETDATE()
          ) as cardsToReview
        FROM Deck d
        WHERE d.userId = @userId
        ORDER BY d.updatedAt DESC
      `);

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

    const pool = await db.getDb();
    const request = pool.request();

    // Usa uma única consulta com subqueries para melhor performance
    const stats = await request
      .input('userId', session.user.id)
      .input('today', new Date().toISOString().split('T')[0])
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM Deck WHERE userId = @userId) as totalDecks,
          (
            SELECT COUNT(*) 
            FROM Flashcard f
            JOIN Deck d ON f.deckId = d.id
            WHERE d.userId = @userId
          ) as totalCards,
          (
            SELECT COUNT(*) 
            FROM Flashcard f
            JOIN Deck d ON f.deckId = d.id
            WHERE d.userId = @userId
            AND f.nextReviewAt <= GETDATE()
          ) as cardsToReview,
          (
            SELECT COUNT(*) 
            FROM FlashcardReview fr
            JOIN Flashcard f ON fr.flashcardId = f.id
            JOIN Deck d ON f.deckId = d.id
            WHERE d.userId = @userId
            AND CAST(fr.reviewedAt AS DATE) = @today
          ) as cardsReviewedToday
      `);

    return { success: true, data: stats.recordset[0] };
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
      .query<IdRecord>(`
        DECLARE @NewId UNIQUEIDENTIFIER = NEWID();
        INSERT INTO Deck (id, userId, title, description, isPublic, createdAt, updatedAt)
        VALUES (@NewId, @userId, @title, @description, @isPublic, GETDATE(), GETDATE());
        SELECT @NewId as id;
      `) as SqlQueryResult<IdRecord>;

    // Revalidar o cache da página de flashcards
    revalidatePath('/estudos/flashcards');

    const id = result.recordset[0]?.id;
    if (!id) {
      throw new Error('Falha ao criar deck');
    }

    return { success: true, data: { id } };
  } catch (error) {
    console.error('Erro ao criar deck:', error);
    return { success: false, error: 'Erro ao criar deck' };
  }
}

export async function getCardsToReviewAction(): Promise<ApiResponse<{ count: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Usuário não autenticado'
      };
    }

    const userId = session.user.id;

    const result = await db.query<{ count: number }>(`
      SELECT COUNT(DISTINCT f.id) as count
      FROM Deck d
      JOIN Flashcard f ON d.id = f.deckId
      WHERE d.userId = @P1
      AND f.nextReviewAt <= GETDATE()
    `, [userId]) as SqlQueryResult<{ count: number }>;

    return {
      success: true,
      data: result.recordset[0]
    };
  } catch (error) {
    console.error('Erro ao buscar cards para revisar:', error);
    return {
      success: false,
      error: 'Erro ao buscar cards para revisar'
    };
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
      `) as SqlQueryResult<Deck>;

    if (!deckResult.recordset[0]) {
      return { success: false, error: 'Deck não encontrado ou sem permissão' };
    }

    const result = await pool.request()
      .input('deckId', params.deckId)
      .input('front', params.front)
      .input('back', params.back)
      .query<IdRecord>(`
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
      `) as SqlQueryResult<IdRecord>;

    // Revalidar o cache da página do deck específico
    revalidatePath(`/estudos/flashcards/${params.deckId}`);

    const id = result.recordset[0]?.id;
    if (!id) {
      throw new Error('Falha ao criar flashcard');
    }

    return { success: true, data: { id } };
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

    const deck = await db.query(`
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
    `, [session.user.id, deckId]);

    if (!deck.recordset[0]) {
      return { success: false, error: 'Deck não encontrado' };
    }

    if (deck.recordset[0].userId !== session.user.id) {
      return { success: false, error: 'Você não tem permissão para acessar este deck' };
    }

    return { success: true, data: deck.recordset[0] };
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

    const pool = await db.getDb();
    const request = pool.request();

    // Query otimizada com OFFSET/FETCH e índices apropriados
    const cards = await request
      .input('userId', session.user.id)
      .input('deckId', deckId)
      .query(`
        WITH RankedCards AS (
          SELECT 
            f.*,
            ROW_NUMBER() OVER (
              ORDER BY 
                CASE 
                  WHEN f.nextReviewAt IS NULL THEN 1 
                  WHEN f.nextReviewAt <= GETDATE() THEN 2
                  ELSE 3 
                END,
                f.nextReviewAt
            ) as RowNum
          FROM Flashcard f WITH (NOLOCK)
          JOIN Deck d WITH (NOLOCK) ON f.deckId = d.id
          WHERE d.userId = @userId
          AND d.id = @deckId
          AND (
            f.nextReviewAt <= GETDATE()
            OR f.nextReviewAt IS NULL
          )
        )
        SELECT *
        FROM RankedCards
        WHERE RowNum <= 20
        OPTION (FAST 20)
      `);

    return { success: true, data: cards.recordset };
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
    
    // Busca otimizada do flashcard com NOLOCK
    const flashcardResult = await request
      .input('flashcardId', mssql.UniqueIdentifier, flashcardId)
      .query<Flashcard & { userId: string }>(`
        SELECT TOP 1 f.*, d.userId 
        FROM Flashcard f WITH (NOLOCK)
        JOIN Deck d WITH (NOLOCK) ON f.deckId = d.id
        WHERE f.id = @flashcardId
      `);

    const flashcard = flashcardResult.recordset[0];
    if (!flashcard) {
      return { success: false, error: 'Flashcard não encontrado' };
    }

    if (flashcard.userId !== session.user.id) {
      return { success: false, error: 'Você não tem permissão para atualizar este flashcard' };
    }

    // Implementação do algoritmo SM2 com otimização de batch update
    const now = new Date();
    let { repetitions = 0, easeFactor = 2.5, interval = 0 } = flashcard;

    quality = Math.max(0, Math.min(5, quality));

    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      
      repetitions++;
    }

    const nextReviewAt = new Date(now);
    nextReviewAt.setDate(now.getDate() + interval);

    // Batch update com transação
    await request.batch(`
      BEGIN TRANSACTION;
      
      UPDATE Flashcard WITH (ROWLOCK)
      SET repetitions = ${repetitions},
          easeFactor = ${easeFactor},
          interval = ${interval},
          nextReviewAt = '${nextReviewAt.toISOString()}',
          lastReviewedAt = '${now.toISOString()}',
          updatedAt = GETDATE()
      WHERE id = '${flashcardId}';

      INSERT INTO FlashcardReview (id, flashcardId, userId, quality, reviewedAt)
      VALUES (
        '${uuidv4()}',
        '${flashcardId}',
        '${session.user.id}',
        ${quality},
        '${now.toISOString()}'
      );
      
      COMMIT TRANSACTION;
    `);

    // Limpa o cache apenas para este deck específico
    db.clearCache();

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar progresso do flashcard:', error);
    return { success: false, error: 'Erro ao atualizar progresso do flashcard' };
  }
} 