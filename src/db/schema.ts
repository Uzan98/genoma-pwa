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
  repetitions: number;
  nextReviewAt: Date;
  lastReviewedAt: Date | null;
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