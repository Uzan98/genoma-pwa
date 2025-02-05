'use server';

import { auth } from '@/auth';
import { db } from '@/db/drizzle';
import type { ApiResponse } from '@/app/estudos/flashcards/types';
import * as mssql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

interface Exam {
  id: string;
  userId: string;
  title: string;
  description: string;
  totalQuestions: number;
  completedQuestions: number;
  score: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface Question {
  id: string;
  examId: string;
  statement: string;
  explanation: string;
  difficulty: number;
  orderNumber: number;
}

interface Answer {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  orderNumber: number;
}

interface UserAnswer {
  id: string;
  userId: string;
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  answeredAt: Date;
}

export async function getExamsAction(): Promise<ApiResponse<Exam[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const result = await db.query<Exam>(`
      SELECT e.*
      FROM Exam e WITH (NOLOCK)
      WHERE e.userId = @P1
      ORDER BY 
        CASE 
          WHEN e.status = 'in_progress' THEN 1
          WHEN e.status = 'not_started' THEN 2
          ELSE 3 
        END,
        e.updatedAt DESC
    `, [session.user.id]);

    return { success: true, data: result.recordset };
  } catch (error) {
    console.error('Erro ao buscar simulados:', error);
    return { success: false, error: 'Erro ao buscar simulados' };
  }
}

export async function getExamQuestionsAction(examId: string): Promise<ApiResponse<(Question & { answers: Answer[] })[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Busca otimizada usando índices compostos
    const result = await db.query<Question & { answers: string }>(`
      SELECT 
        q.*,
        (
          SELECT JSON_QUERY((
            SELECT a.*
            FROM Answer a WITH (NOLOCK)
            WHERE a.questionId = q.id
            ORDER BY a.orderNumber
            FOR JSON PATH
          ))
        ) as answers
      FROM Question q WITH (NOLOCK)
      JOIN Exam e WITH (NOLOCK) ON q.examId = e.id
      WHERE e.id = @P1
      AND e.userId = @P2
      ORDER BY q.orderNumber
      OPTION (FAST 50)
    `, [examId, session.user.id]);

    // Parse das respostas do JSON
    const questions = result.recordset.map(q => ({
      ...q,
      answers: JSON.parse(q.answers as string)
    }));

    return { success: true, data: questions };
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    return { success: false, error: 'Erro ao buscar questões' };
  }
}

export async function submitAnswerAction(questionId: string, answerId: string): Promise<ApiResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const pool = await db.getDb();
    const request = pool.request();

    // Verifica se a resposta está correta e atualiza tudo em uma única transação
    await request.batch(`
      BEGIN TRANSACTION;
      
      DECLARE @IsCorrect BIT;
      DECLARE @ExamId NVARCHAR(255);
      
      -- Busca se a resposta está correta e o examId
      SELECT 
        @IsCorrect = a.isCorrect,
        @ExamId = q.examId
      FROM Answer a WITH (NOLOCK)
      JOIN Question q WITH (NOLOCK) ON a.questionId = q.id
      WHERE a.id = '${answerId}'
      AND q.id = '${questionId}';
      
      -- Registra a resposta do usuário
      INSERT INTO UserAnswer (
        id, 
        userId,
        questionId,
        answerId,
        isCorrect,
        answeredAt
      )
      VALUES (
        '${uuidv4()}',
        '${session.user.id}',
        '${questionId}',
        '${answerId}',
        @IsCorrect,
        GETDATE()
      );
      
      -- Atualiza o progresso do simulado
      UPDATE Exam WITH (ROWLOCK)
      SET 
        completedQuestions = (
          SELECT COUNT(DISTINCT ua.questionId)
          FROM UserAnswer ua
          JOIN Question q ON ua.questionId = q.id
          WHERE q.examId = @ExamId
        ),
        score = (
          SELECT CAST(COUNT(CASE WHEN ua.isCorrect = 1 THEN 1 END) AS FLOAT) / COUNT(*) * 100
          FROM UserAnswer ua
          JOIN Question q ON ua.questionId = q.id
          WHERE q.examId = @ExamId
        ),
        status = 'in_progress',
        updatedAt = GETDATE()
      WHERE id = @ExamId
      AND userId = '${session.user.id}';
      
      COMMIT TRANSACTION;
    `);

    return { success: true };
  } catch (error) {
    console.error('Erro ao submeter resposta:', error);
    return { success: false, error: 'Erro ao submeter resposta' };
  }
}

export async function finishExamAction(examId: string): Promise<ApiResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    await db.query(`
      UPDATE Exam WITH (ROWLOCK)
      SET 
        status = 'completed',
        updatedAt = GETDATE()
      WHERE id = @P1
      AND userId = @P2
    `, [examId, session.user.id]);

    return { success: true };
  } catch (error) {
    console.error('Erro ao finalizar simulado:', error);
    return { success: false, error: 'Erro ao finalizar simulado' };
  }
} 