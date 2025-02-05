'use client';

import { useEffect, useState } from 'react';
import { RotateCw, Star } from 'lucide-react';
import { FlashcardsLayout } from '../../components/FlashcardsLayout';
import { useRouter } from 'next/navigation';
import { useFlashcards, useFlashcardProgress } from '@/hooks/useFlashcards';
import { useQueryClient } from '@tanstack/react-query';
import { getFlashcardsAction } from '@/app/estudos/flashcards/actions';
import { QUERY_KEYS } from '@/hooks/useFlashcards';

type Props = {
  params: {
    deckId: string;
  };
};

// Componente de Skeleton para o card
function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
      <div className="text-center space-y-8">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frente
          </h3>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function StudyPage({ params }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0
  });

  // Novo estado para controlar os cards que precisam de revisão
  const [cardsToReview, setCardsToReview] = useState<Array<{ card: any; delay: number }>>([]);
  
  // Estado para controlar cards já dominados (marcados como fácil)
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());

  // Usando React Query para buscar os flashcards
  const { data: flashcards = [], isPending, error: flashcardsError } = useFlashcards(params.deckId);
  const { mutate: updateProgress, isPending: updating } = useFlashcardProgress();

  // Prefetch dos dados ao passar o mouse sobre os botões de navegação
  const prefetchDeckData = async (deckId: string) => {
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.flashcards(deckId),
      queryFn: () => getFlashcardsAction(deckId),
    });
  };

  // Reseta o estado quando mudar de deck
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionComplete(false);
    setSessionStats({ total: 0, easy: 0, medium: 0, hard: 0 });
    setCardsToReview([]);
    setMasteredCards(new Set());
  }, [params.deckId]);

  async function handleAnswer(quality: number) {
    if (!flashcards.length || updating || isTransitioning) return;

    const currentCard = flashcards[currentIndex];
    setIsTransitioning(true);
    
    updateProgress(
      { flashcardId: currentCard.id, quality },
      {
        onSuccess: () => {
          // Atualiza as estatísticas da sessão
          setSessionStats(prev => {
            const newStats = { ...prev, total: prev.total + 1 };
            if (quality >= 4) newStats.easy++;
            else if (quality >= 2) newStats.medium++;
            else newStats.hard++;
            return newStats;
          });

          // Lógica de revisão baseada na qualidade
          if (quality >= 4) {
            // Fácil - marca como dominado
            setMasteredCards(prev => new Set([...prev, currentCard.id]));
          } else {
            // Difícil ou Médio - adiciona para revisão
            const delay = quality >= 2 ? 3 : 1; // Médio espera 3 cards, Difícil espera 1
            setCardsToReview(prev => [...prev, { card: currentCard, delay }]);
          }

          // Aguarda a animação de fade out
          setTimeout(() => {
            const nextCard = getNextCard();
            if (nextCard) {
              setCurrentIndex(nextCard.index);
              setShowAnswer(false);
            } else {
              // Só termina se todos os cards estiverem dominados
              const allMastered = flashcards.every(card => 
                Array.from(masteredCards).includes(card.id)
              );
              if (allMastered) {
                setSessionComplete(true);
              } else {
                // Continua com os cards que precisam revisão
                processReviewQueue();
              }
            }
            setIsTransitioning(false);
          }, 300);
        },
        onError: () => {
          setIsTransitioning(false);
        }
      }
    );
  }

  // Função para obter o próximo card não dominado
  const getNextCard = () => {
    for (let i = currentIndex + 1; i < flashcards.length; i++) {
      if (!masteredCards.has(flashcards[i].id)) {
        return { index: i };
      }
    }
    return null;
  };

  // Função para processar a fila de revisão
  const processReviewQueue = () => {
    if (cardsToReview.length > 0) {
      // Reduz o delay de todos os cards e pega o próximo pronto
      const updatedQueue = cardsToReview.map(item => ({
        ...item,
        delay: item.delay - 1
      }));

      const readyToReview = updatedQueue.find(item => item.delay <= 0);
      const remainingQueue = updatedQueue.filter(item => item.delay > 0);

      if (readyToReview) {
        // Encontra o índice do card pronto para revisão
        const cardIndex = flashcards.findIndex(card => card.id === readyToReview.card.id);
        setCurrentIndex(cardIndex);
        setCardsToReview(remainingQueue);
      } else {
        setCardsToReview(updatedQueue);
        const nextCard = getNextCard();
        if (nextCard) {
          setCurrentIndex(nextCard.index);
        }
      }
      setShowAnswer(false);
    }
  };

  if (isPending) {
    return (
      <FlashcardsLayout 
        title="Carregando..."
        backUrl="/estudos/flashcards"
      >
        <div className="max-w-2xl mx-auto">
          {/* Barra de Progresso Skeleton */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full w-1/3 animate-pulse" />
          </div>

          {/* Card Skeleton */}
          <CardSkeleton />

          {/* Botões de Ação Skeleton */}
          <div className="flex justify-center">
            <div className="w-48 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </FlashcardsLayout>
    );
  }

  if (flashcardsError || !flashcards) {
    return (
      <FlashcardsLayout 
        title="Erro"
        backUrl="/estudos/flashcards"
      >
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <span className="text-lg">Erro ao carregar flashcards</span>
        </div>
      </FlashcardsLayout>
    );
  }

  if (flashcards.length === 0) {
    return (
      <FlashcardsLayout
        title="Sem Cards"
        subtitle="Modo de Estudo"
        backUrl="/estudos/flashcards"
      >
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>Nenhum flashcard para revisar neste momento.</p>
          <button
            onClick={() => router.push(`/estudos/flashcards/${params.deckId}`)}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Voltar ao Deck
          </button>
        </div>
      </FlashcardsLayout>
    );
  }

  if (sessionComplete) {
    return (
      <FlashcardsLayout
        title="Sessão Concluída!"
        subtitle="Parabéns!"
        backUrl="/estudos/flashcards"
      >
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Star className="w-16 h-16 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Você completou a sessão de estudo!
              </h2>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {sessionStats.easy}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Fácil
                  </div>
                </div>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {sessionStats.medium}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    Médio
                  </div>
                </div>
                <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {sessionStats.hard}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Difícil
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/estudos/flashcards')}
              onMouseEnter={() => prefetchDeckData(params.deckId)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Voltar aos Decks
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setShowAnswer(false);
                setSessionComplete(false);
                setSessionStats({ total: 0, easy: 0, medium: 0, hard: 0 });
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Estudar Novamente
            </button>
          </div>
        </div>
      </FlashcardsLayout>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <FlashcardsLayout
      title="Modo de Estudo"
      subtitle={`Card ${currentIndex + 1} de ${flashcards.length}`}
      backUrl="/estudos/flashcards"
    >
      <div className="max-w-2xl mx-auto">
        {/* Barra de Progresso */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
          <div
            className="h-2 bg-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card com transição suave */}
        <div 
          className={`bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8 transition-all duration-300 ${
            isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div className="text-center space-y-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frente
              </h3>
              <p className="text-xl text-gray-900 dark:text-white">{currentCard.front}</p>
            </div>

            {showAnswer && (
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verso
                </h3>
                <p className="text-xl text-gray-900 dark:text-white">{currentCard.back}</p>
              </div>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-center gap-4">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              disabled={updating || isTransitioning}
            >
              <RotateCw className={`w-5 h-5 ${updating ? 'animate-spin' : ''}`} />
              Mostrar Resposta
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-4 w-full">
              {/* Difícil - 1 */}
              <button
                onClick={() => handleAnswer(1)}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
                disabled={updating || isTransitioning}
              >
                <span className="text-sm">Difícil</span>
                <span className="text-xs">&lt; 1 min</span>
              </button>

              {/* Bom - 3 */}
              <button
                onClick={() => handleAnswer(3)}
                className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
                disabled={updating || isTransitioning}
              >
                <span className="text-sm">Bom</span>
                <span className="text-xs">~10 min</span>
              </button>

              {/* Fácil - 5 */}
              <button
                onClick={() => handleAnswer(5)}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
                disabled={updating || isTransitioning}
              >
                <span className="text-sm">Fácil</span>
                <span className="text-xs">4 dias</span>
              </button>
            </div>
          )}
        </div>

        {/* Indicador de Loading */}
        {(updating || isTransitioning) && (
          <div className="flex justify-center mt-4">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </FlashcardsLayout>
  );
} 