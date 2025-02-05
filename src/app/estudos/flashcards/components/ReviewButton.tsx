'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain } from 'lucide-react';
import { getCardsToReviewAction } from '../actions';

export function ReviewButton() {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCount() {
      try {
        const response = await getCardsToReviewAction();
        if (response.success) {
          setCount(response.data.count);
        } else {
          setError(response.error || 'Erro ao carregar contagem');
        }
      } catch (err) {
        setError('Erro ao carregar contagem');
      } finally {
        setLoading(false);
      }
    }

    loadCount();
  }, []);

  if (loading || error || count === null) {
    return null;
  }

  if (count === 0) {
    return (
      <button
        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-not-allowed"
        disabled
      >
        <span className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Nada para revisar
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push('/estudos/flashcards/review')}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
    >
      <span className="flex items-center gap-2">
        <Brain className="w-5 h-5" />
        Revisar {count} cards
      </span>
    </button>
  );
} 