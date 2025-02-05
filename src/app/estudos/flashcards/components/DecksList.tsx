'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDecksAction } from '../actions';
import { CreateFlashcardButton } from './CreateFlashcardButton';
import type { Deck } from '../types';

interface DeckWithStats extends Deck {
  totalCards: number;
  cardsToReview: number;
}

export function DecksList() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDecks() {
      try {
        const response = await getDecksAction();
        if (response.success) {
          setDecks(response.data);
        } else {
          setError(response.error || 'Erro ao carregar decks');
        }
      } catch (err) {
        setError('Erro ao carregar decks');
      } finally {
        setLoading(false);
      }
    }

    loadDecks();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6" />
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <p>Nenhum deck encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => (
        <div
          key={deck.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {deck.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {deck.description}
          </p>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {deck.totalCards} cards • {deck.cardsToReview} para revisar
            </div>
            <div className="flex gap-2">
              <CreateFlashcardButton deckId={deck.id} />
              <button
                onClick={() => router.push(`/estudos/flashcards/${deck.id}/study`)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Estudar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 