'use client';

import { Suspense } from 'react';
import {
  DecksList,
  CreateDeckButton,
  FlashcardStats,
  ReviewButton,
  FlashcardsLayout
} from './components';

export default function FlashcardsPage() {
  return (
    <FlashcardsLayout
      title="Flashcards"
      subtitle="Gerencie seus decks e estude com repetição espaçada"
      showBackButton={false}
      actions={
        <>
          <ReviewButton />
          <CreateDeckButton />
        </>
      }
    >
      <div className="space-y-8">
        <Suspense fallback={<div>Carregando estatísticas...</div>}>
          <FlashcardStats />
        </Suspense>

        <Suspense fallback={<div>Carregando decks...</div>}>
          <DecksList />
        </Suspense>
      </div>
    </FlashcardsLayout>
  );
} 