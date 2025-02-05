import { Simulado as DBSimulado } from '@/db/queries';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  studyHours: StudyHour[];
  simulados: Simulado[];
  simuladoAttempts: SimuladoAttempt[];
}

export interface StudyHour {
  id: string;
  userId: string;
  date: Date;
  hours: number;
  subject: string;
  createdAt: Date;
  user: User;
}

export interface Simulado extends DBSimulado {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  questions?: Question[];
  attempts?: SimuladoAttempt[];
}

export interface Question {
  id: string;
  simuladoId: string;
  statement: string;
  correctAlternative: number;
  alternatives: Alternative[];
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
  user?: {
    id: string;
    name: string;
    email: string;
  };
  simulado?: Simulado;
  answers: Answer[];
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAlternative: number;
  isCorrect: boolean;
} 