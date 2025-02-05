'use client';

import { useEffect, useState } from 'react';
import { Brain, Library, RotateCw } from 'lucide-react';
import { getFlashcardStatsAction } from '../actions';
import type { FlashcardStats as FlashcardStatsType } from '../types';

export function FlashcardStats() {
  const [stats, setStats] = useState<FlashcardStatsType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await getFlashcardStatsAction();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError(response.error || 'Erro ao carregar estatísticas');
        }
      } catch (error) {
        setError('Erro ao carregar estatísticas');
      }
    }

    loadStats();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div>Carregando estatísticas...</div>;
  }

  const cards = [
    {
      icon: Library,
      title: 'Total de Decks',
      value: stats.totalDecks,
      color: 'text-blue-600'
    },
    {
      icon: Brain,
      title: 'Total de Cards',
      value: stats.totalCards,
      color: 'text-purple-600'
    },
    {
      icon: RotateCw,
      title: 'Cards para Revisar',
      value: stats.cardsToReview,
      color: 'text-orange-600'
    },
    {
      icon: Brain,
      title: 'Revisados Hoje',
      value: stats.cardsReviewedToday,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <card.icon className={`w-8 h-8 ${card.color} mb-4`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {card.value}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {card.title}
          </p>
        </div>
      ))}
    </div>
  );
} 