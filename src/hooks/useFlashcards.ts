'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFlashcardsAction, updateFlashcardProgressAction } from '@/app/estudos/flashcards/actions';
import type { ApiResponse, Flashcard, Deck } from '@/app/estudos/flashcards/types';
import React from 'react';

// Chaves de cache constantes para evitar erros de digitação
export const QUERY_KEYS = {
  flashcards: (deckId: string) => ['flashcards', deckId] as const,
  allDecks: ['decks'] as const,
};

export function useFlashcards(deckId: string) {
  const queryClient = useQueryClient();

  // Prefetch do próximo deck quando houver
  const prefetchNextDeck = React.useCallback(async (currentDeckId: string) => {
    const decks = queryClient.getQueryData<Deck[]>(QUERY_KEYS.allDecks);
    if (decks?.length) {
      const currentIndex = decks.findIndex(deck => deck.id === currentDeckId);
      const nextDeck = decks[currentIndex + 1];
      if (nextDeck) {
        await queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.flashcards(nextDeck.id),
          queryFn: () => getFlashcardsAction(nextDeck.id),
        });
      }
    }
  }, [queryClient]);

  // Efeito para prefetch
  React.useEffect(() => {
    prefetchNextDeck(deckId);
  }, [deckId, prefetchNextDeck]);

  return useQuery<ApiResponse<Flashcard[]>, Error, Flashcard[]>({
    queryKey: QUERY_KEYS.flashcards(deckId),
    queryFn: () => getFlashcardsAction(deckId),
    select: (data) => data.data || [],
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useFlashcardProgress() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, { flashcardId: string; quality: number }>({
    mutationFn: ({ flashcardId, quality }) =>
      updateFlashcardProgressAction(flashcardId, quality),
    onSuccess: () => {
      // Invalida o cache dos flashcards após uma atualização
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
} 