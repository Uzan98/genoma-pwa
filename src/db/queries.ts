import { query } from '@/lib/db';

// Tipos
export interface Simulado {
  id: string;
  userId: string;
  title: string;
  description: string;
  time: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface Question {
  id: string;
  simuladoId: string;
  statement: string;
  correctAlternative: number;
}

export interface Alternative {
  id: string;
  questionId: string;
  text: string;
}

export interface SimuladoAttempt {
  id: string;
  userId: string;
  simuladoId: string;
  startedAt: Date;
  finishedAt: Date | null;
  score: number | null;
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAlternative: number;
  isCorrect: boolean;
}

// Interfaces de Flashcard
export interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty: number;
  nextReviewDate: Date;
  lastReviewDate: Date | null;
  repetitions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardReview {
  id: string;
  flashcardId: string;
  userId: string;
  quality: number;
  reviewedAt: Date;
}

// Queries de Simulado
export async function createSimulado(simulado: Omit<Simulado, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await query(`
    DECLARE @NewId NVARCHAR(255) = NEWID();
    INSERT INTO Simulado (id, userId, title, description, time, isPublic)
    VALUES (@NewId, @P1, @P2, @P3, @P4, @P5);
    SELECT @NewId as id;
  `, [simulado.userId, simulado.title, simulado.description, simulado.time, simulado.isPublic]);
  
  return result[0].id as string;
}

export async function getSimuladoById(id: string) {
  const result = await query(`SELECT * FROM Simulado WHERE id = @P1`, [id]);
  return result[0] as Simulado;
}

export async function getSimuladosByUserId(userId: string) {
  const result = await query(`
    SELECT * FROM Simulado 
    WHERE userId = @P1 OR isPublic = 1
    ORDER BY createdAt DESC
  `, [userId]);
  
  return result as Simulado[];
}

// Queries de Questão
export async function createQuestion(question: Omit<Question, 'id'>) {
  const result = await query(`
    DECLARE @NewId NVARCHAR(255) = NEWID();
    INSERT INTO Question (id, simuladoId, statement, correctAlternative)
    VALUES (@NewId, @P1, @P2, @P3);
    SELECT @NewId as id;
  `, [question.simuladoId, question.statement, question.correctAlternative]);
  
  return result[0].id as string;
}

export async function getQuestionsBySimuladoId(simuladoId: string) {
  const result = await query(`SELECT * FROM Question WHERE simuladoId = @P1`, [simuladoId]);
  return result as Question[];
}

// Queries de Alternativa
export async function createAlternative(alternative: Omit<Alternative, 'id'>) {
  const result = await query(`
    DECLARE @NewId NVARCHAR(255) = NEWID();
    INSERT INTO Alternative (id, questionId, text)
    VALUES (@NewId, @P1, @P2);
    SELECT @NewId as id;
  `, [alternative.questionId, alternative.text]);
  
  return result[0].id as string;
}

export async function getAlternativesByQuestionId(questionId: string) {
  const result = await query(`SELECT * FROM Alternative WHERE questionId = @P1`, [questionId]);
  return result as Alternative[];
}

// Queries de Tentativa
export async function createSimuladoAttempt(attempt: Omit<SimuladoAttempt, 'id' | 'startedAt' | 'finishedAt' | 'score'>) {
  const result = await query(`
    DECLARE @NewId NVARCHAR(255) = NEWID();
    INSERT INTO SimuladoAttempt (id, userId, simuladoId)
    VALUES (@NewId, @P1, @P2);
    SELECT @NewId as id;
  `, [attempt.userId, attempt.simuladoId]);
  
  return result[0].id as string;
}

export async function finishSimuladoAttempt(attemptId: string, score: number) {
  await query(`
    UPDATE SimuladoAttempt 
    SET finishedAt = GETDATE(), score = @P1
    WHERE id = @P2
  `, [score, attemptId]);
}

export async function getSimuladoAttemptsByUserId(userId: string) {
  const result = await query(`
    SELECT * FROM SimuladoAttempt 
    WHERE userId = @P1
    ORDER BY startedAt DESC
  `, [userId]);
  
  return result as SimuladoAttempt[];
}

// Queries de Resposta
export async function createAnswer(answer: Omit<Answer, 'id'>) {
  const result = await query(`
    DECLARE @NewId NVARCHAR(255) = NEWID();
    INSERT INTO Answer (id, attemptId, questionId, selectedAlternative, isCorrect)
    VALUES (@NewId, @P1, @P2, @P3, @P4);
    SELECT @NewId as id;
  `, [answer.attemptId, answer.questionId, answer.selectedAlternative, answer.isCorrect]);
  
  return result[0].id as string;
}

export async function getAnswersByAttemptId(attemptId: string) {
  const result = await query(`SELECT * FROM Answer WHERE attemptId = @P1`, [attemptId]);
  return result as Answer[];
}

// Query para calcular a pontuação do simulado
export async function calculateSimuladoScore(answers: { questionId: string; selectedAlternative: number }[], simuladoId: string) {
  const questions = await getQuestionsBySimuladoId(simuladoId);
  let correctAnswers = 0;

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.correctAlternative === answer.selectedAlternative) {
      correctAnswers++;
    }
  }

  return (correctAnswers / questions.length) * 100;
}

// Query Complexa - Obter Simulado Completo com Questões e Alternativas
export async function getCompleteSimulado(simuladoId: string) {
  const simulado = await getSimuladoById(simuladoId);
  if (!simulado) return null;

  const questions = await getQuestionsBySimuladoId(simuladoId);
  const questionsWithAlternatives = await Promise.all(
    questions.map(async (question) => {
      const alternatives = await getAlternativesByQuestionId(question.id);
      const { correctAlternative, ...questionWithoutAnswer } = question;
      return {
        ...questionWithoutAnswer,
        alternatives
      };
    })
  );

  return {
    ...simulado,
    questions: questionsWithAlternatives
  };
}

// Query Complexa - Obter Estatísticas do Usuário
export async function getUserSimuladoStats(userId: string) {
  const result = await query(`
    SELECT 
      s.title,
      COUNT(sa.id) as attempts,
      AVG(sa.score) as averageScore,
      MAX(sa.score) as highestScore
    FROM Simulado s
    LEFT JOIN SimuladoAttempt sa ON s.id = sa.simuladoId
    WHERE s.userId = @P1 OR sa.userId = @P1
    GROUP BY s.id, s.title
  `, [userId]);
  
  return result;
}

// Queries de Deck
export async function createDeck(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await query(`
    DECLARE @NewId NVARCHAR(255) = NEWID();
    INSERT INTO Deck (id, userId, title, description, isPublic)
    VALUES (@NewId, @P1, @P2, @P3, @P4);
    SELECT @NewId as id;
  `, [deck.userId, deck.title, deck.description, deck.isPublic]);
  
  return result[0].id as string;
}

export async function getDecksByUserId(userId: string) {
  const result = await query(`
    SELECT 
      d.*,
      COUNT(f.id) as totalCards,
      COUNT(CASE WHEN f.nextReviewDate <= GETDATE() THEN 1 END) as cardsToReview
    FROM Deck d
    LEFT JOIN Flashcard f ON d.id = f.deckId
    WHERE d.userId = @P1 OR d.isPublic = 1
    GROUP BY d.id, d.userId, d.title, d.description, d.isPublic, d.createdAt, d.updatedAt
    ORDER BY d.createdAt DESC
  `, [userId]);
  
  return result;
}

export async function getDeckById(id: string) {
  const result = await query(`SELECT * FROM Deck WHERE id = @P1`, [id]);
  return result[0] as Deck;
}

// Queries de Flashcard
export async function createFlashcard(flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'nextReviewDate' | 'lastReviewDate' | 'repetitions'>) {
  const result = await query(`
    DECLARE @NewId NVARCHAR(255) = NEWID();
    INSERT INTO Flashcard (id, deckId, front, back, difficulty, nextReviewDate, repetitions)
    VALUES (@NewId, @P1, @P2, @P3, @P4, GETDATE(), 0);
    SELECT @NewId as id;
  `, [flashcard.deckId, flashcard.front, flashcard.back, flashcard.difficulty]);
  
  return result[0].id as string;
}

export async function getFlashcardsByDeckId(deckId: string) {
  const result = await query(`
    SELECT * FROM Flashcard 
    WHERE deckId = @P1
    ORDER BY nextReviewDate ASC
  `, [deckId]);
  
  return result as Flashcard[];
}

export async function getFlashcardsToReview(userId: string) {
  const result = await query(`
    SELECT f.* 
    FROM Flashcard f
    JOIN Deck d ON f.deckId = d.id
    WHERE (d.userId = @P1 OR d.isPublic = 1)
    AND f.nextReviewDate <= GETDATE()
    ORDER BY f.nextReviewDate ASC
  `, [userId]);
  
  return result as Flashcard[];
}

// Queries de Review
export async function createFlashcardReview(review: Omit<FlashcardReview, 'id' | 'reviewedAt'>) {
  const result = await query(`
    DECLARE @NewId NVARCHAR(255) = NEWID();
    INSERT INTO FlashcardReview (id, flashcardId, userId, quality)
    VALUES (@NewId, @P1, @P2, @P3);

    -- Atualiza o flashcard com base no algoritmo SM-2
    UPDATE Flashcard
    SET 
      lastReviewDate = GETDATE(),
      repetitions = CASE 
        WHEN @P3 >= 3 THEN repetitions + 1 
        ELSE 0 
      END,
      nextReviewDate = DATEADD(day, 
        CASE 
          WHEN @P3 < 3 THEN 1
          WHEN repetitions = 0 THEN 1
          WHEN repetitions = 1 THEN 3
          ELSE repetitions * 7
        END, 
        GETDATE()
      )
    WHERE id = @P1;

    SELECT @NewId as id;
  `, [review.flashcardId, review.userId, review.quality]);
  
  return result[0].id as string;
}

export async function getFlashcardStats(userId: string) {
  const result = await query(`
    SELECT 
      d.title as deckTitle,
      COUNT(f.id) as totalCards,
      AVG(fr.quality) as averageQuality,
      COUNT(CASE WHEN f.nextReviewDate <= GETDATE() THEN 1 END) as cardsToReview
    FROM Deck d
    LEFT JOIN Flashcard f ON d.id = f.deckId
    LEFT JOIN FlashcardReview fr ON f.id = fr.flashcardId AND fr.userId = @P1
    WHERE d.userId = @P1 OR d.isPublic = 1
    GROUP BY d.id, d.title
  `, [userId]);
  
  return result;
} 