import { IResult } from 'mssql';

export type SqlQueryResult<T> = IResult<T> & {
  recordset: T[];
};

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalCards?: number;
  cardsToReview?: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  repetitions: number;
  easeFactor: number;
  interval: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardReview {
  id: string;
  flashcardId: string;
  quality: number; // 0-5 (0=blackout, 5=perfect)
  reviewedAt: Date;
}

export interface FlashcardStats {
  totalDecks: number;
  totalCards: number;
  cardsToReview: number;
  cardsReviewedToday: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 