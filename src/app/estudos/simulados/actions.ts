'use server';

import { auth } from '@/auth';
import { query } from '@/lib/db';
import { 
  createSimulado,
  createQuestion,
  createAlternative,
  getCompleteSimulado,
  getSimuladosByUserId,
  Simulado,
  createSimuladoAttempt,
  calculateSimuladoScore,
  getQuestionsBySimuladoId,
  createAnswer,
  finishSimuladoAttempt
} from '@/db/queries';

interface QuestionData {
  statement: string;
  correctAlternative: number;
  alternatives: string[];
}

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createSimuladoAction(formData: FormData): Promise<ActionResponse<string>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Não autorizado');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const time = parseInt(formData.get('time') as string);
    const isPublic = formData.get('isPublic') === 'on';
    const questionsData = JSON.parse(formData.get('questions') as string) as QuestionData[];

    // Criar o simulado
    const simuladoId = await createSimulado({
      userId: session.user.id,
      title,
      description,
      time,
      isPublic
    });

    // Criar as questões e alternativas
    for (const questionData of questionsData) {
      const questionId = await createQuestion({
        simuladoId,
        statement: questionData.statement,
        correctAlternative: questionData.correctAlternative
      });

      // Criar as alternativas
      for (const alternativeText of questionData.alternatives) {
        await createAlternative({
          questionId,
          text: alternativeText
        });
      }
    }

    return { success: true, data: simuladoId };
  } catch (error) {
    console.error('Erro ao criar simulado:', error);
    return { success: false, error: 'Erro ao criar simulado' };
  }
}

export async function getSimuladosAction(): Promise<ActionResponse<Simulado[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Não autorizado');

    const simulados = await getSimuladosByUserId(session.user.id);
    return { success: true, data: simulados };
  } catch (error) {
    console.error('Erro ao buscar simulados:', error);
    return { success: false, error: 'Erro ao buscar simulados' };
  }
}

export async function getSimuladoAction(id: string): Promise<ActionResponse<Simulado | null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Não autorizado');

    const simulado = await getCompleteSimulado(id);
    if (!simulado) throw new Error('Simulado não encontrado');

    return { success: true, data: simulado };
  } catch (error) {
    console.error('Erro ao buscar simulado:', error);
    return { success: false, error: 'Erro ao buscar simulado' };
  }
}

interface SimuladoHistory {
  id: string;
  simuladoTitle: string;
  startedAt: Date;
  finishedAt: Date;
  score: number;
}

export async function getSimuladoHistoryAction(): Promise<ActionResponse<SimuladoHistory[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Não autorizado');

    const history = await query<SimuladoHistory[]>(`
      SELECT 
        sa.id,
        s.title as simuladoTitle,
        sa.startedAt,
        sa.finishedAt,
        sa.score
      FROM SimuladoAttempt sa
      JOIN Simulado s ON s.id = sa.simuladoId
      WHERE sa.userId = @P1 AND sa.finishedAt IS NOT NULL
      ORDER BY sa.startedAt DESC
    `, [session.user.id]);

    return { success: true, data: history };
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return { success: false, error: 'Erro ao buscar histórico' };
  }
}

export async function closeModalAction() {
  return { success: true };
}

interface FinishSimuladoData {
  simuladoId: string;
  answers: Record<string, number>; // questionId -> selectedAlternative
}

export async function finishSimuladoAction(data: FinishSimuladoData): Promise<ActionResponse<number>> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Não autorizado');

    // Criar tentativa
    const attemptId = await createSimuladoAttempt({
      userId: session.user.id,
      simuladoId: data.simuladoId
    });

    // Preparar respostas para cálculo da pontuação
    const answersArray = Object.entries(data.answers).map(([questionId, selectedAlternative]) => ({
      questionId,
      selectedAlternative
    }));

    // Calcular pontuação
    const score = await calculateSimuladoScore(answersArray, data.simuladoId);

    // Salvar respostas
    const questions = await getQuestionsBySimuladoId(data.simuladoId);
    for (const [questionId, selectedAlternative] of Object.entries(data.answers)) {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        await createAnswer({
          attemptId,
          questionId,
          selectedAlternative,
          isCorrect: question.correctAlternative === selectedAlternative
        });
      }
    }

    // Finalizar tentativa
    await finishSimuladoAttempt(attemptId, score);

    return { success: true, data: score };
  } catch (error) {
    console.error('Erro ao finalizar simulado:', error);
    return { success: false, error: 'Erro ao finalizar simulado' };
  }
}

export async function selectQuestionAction(index: number) {
  'use server';
  return { success: true, data: index };
} 