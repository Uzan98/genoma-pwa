'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDeckAction, getFlashcardsAction } from '../actions';
import { FlashcardsLayout } from '../components/FlashcardsLayout';
import { CreateFlashcardButton } from '../components/CreateFlashcardButton';
import type { Deck, Flashcard } from '../types';

interface PageProps {
  params: {
    deckId: string;
  };
}

export default function DeckPage({ params }: PageProps) {
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      const [deckResponse, flashcardsResponse] = await Promise.all([
        getDeckAction(params.deckId),
        getFlashcardsAction(params.deckId)
      ]);

      if (deckResponse.success && deckResponse.data) {
        setDeck(deckResponse.data);
      } else {
        setError(deckResponse.error || 'Erro ao carregar deck');
        return;
      }

      if (flashcardsResponse.success && flashcardsResponse.data) {
        setFlashcards(flashcardsResponse.data);
      } else {
        setError(flashcardsResponse.error || 'Erro ao carregar flashcards');
      }
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [params.deckId]);

  if (loading) {
    return (
      <FlashcardsLayout title="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </FlashcardsLayout>
    );
  }

  if (error || !deck) {
    return (
      <FlashcardsLayout title="Erro">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <span className="text-lg">{error || 'Deck não encontrado'}</span>
        </div>
      </FlashcardsLayout>
    );
  }

  return (
    <FlashcardsLayout
      title={deck.title}
      subtitle={deck.description}
      actions={
        <div className="flex gap-2">
          <CreateFlashcardButton deckId={deck.id} />
          <button
            onClick={() => router.push(`/estudos/flashcards/${deck.id}/study`)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Estudar
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((card) => (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frente
                  </h3>
                  <p className="text-gray-900 dark:text-white">{card.front}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verso
                  </h3>
                  <p className="text-gray-900 dark:text-white">{card.back}</p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Repetições: {card.repetitions}</span>
                    <span>
                      Próxima revisão:{' '}
                      {new Date(card.nextReviewAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {flashcards.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Nenhum flashcard encontrado neste deck.</p>
          </div>
        )}
      </div>
    </FlashcardsLayout>
  );
} 