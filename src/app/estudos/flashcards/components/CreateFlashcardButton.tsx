'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createFlashcardAction } from '../actions';

interface CreateFlashcardButtonProps {
  deckId: string;
}

export function CreateFlashcardButton({ deckId }: CreateFlashcardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createFlashcardAction({
        deckId,
        front,
        back
      });

      if (response.success) {
        setIsOpen(false);
        setFront('');
        setBack('');
      } else {
        setError(response.error || 'Erro ao criar flashcard');
      }
    } catch (err) {
      setError('Erro ao criar flashcard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Novo Flashcard
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="front"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Frente
                </label>
                <textarea
                  id="front"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="back"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Verso
                </label>
                <textarea
                  id="back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 