'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSimuladoAction, finishSimuladoAction, selectQuestionAction } from '../actions';
import { Simulado } from '@/db/queries';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const SimuladoFeedback = dynamic(() => import('@/components/features/simulados/SimuladoFeedback').then(mod => mod.SimuladoFeedback));
const QuestionNavigation = dynamic(() => import('@/components/features/simulados/QuestionNavigation').then(mod => mod.QuestionNavigation));

interface Question {
  id: string;
  statement: string;
  alternatives: {
    id: string;
    text: string;
  }[];
}

interface SimuladoWithQuestions extends Simulado {
  questions: Question[];
}

interface SimuladoContentProps {
  id: string;
}

export default function SimuladoContent({ id }: SimuladoContentProps) {
  const router = useRouter();
  const [simulado, setSimulado] = useState<SimuladoWithQuestions | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    async function loadSimulado() {
      try {
        const response = await getSimuladoAction(id);
        if (response.success && response.data) {
          setSimulado(response.data as SimuladoWithQuestions);
          setTimeLeft(response.data.time * 60); // Converte minutos para segundos
        } else {
          setError(response.error || 'Erro ao carregar simulado');
        }
      } catch (err) {
        setError('Erro ao carregar simulado');
      } finally {
        setIsLoading(false);
      }
    }

    loadSimulado();
  }, [id]);

  // Timer
  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleFinishSimulado();
          return 0;
        }
        setTimeSpent(old => old + 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectQuestion = useCallback(async (index: number) => {
    const response = await selectQuestionAction(index);
    if (response.success) {
      setCurrentQuestion(response.data);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !simulado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || 'Simulado não encontrado'}</p>
        <Button onClick={() => router.push('/estudos/simulados')}>
          Voltar para Simulados
        </Button>
      </div>
    );
  }

  const currentQuestionData = simulado.questions[currentQuestion];
  const totalQuestions = simulado.questions.length;
  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;

  function handleSelectAlternative(questionId: string, alternativeIndex: number) {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: alternativeIndex
    }));
  }

  function handleNextQuestion() {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }

  function handlePreviousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }

  async function handleFinishSimulado() {
    if (!simulado) return;
    
    if (Object.keys(selectedAnswers).length < totalQuestions) {
      toast.error('Responda todas as questões antes de finalizar');
      return;
    }

    try {
      const response = await finishSimuladoAction({
        simuladoId: simulado.id,
        answers: selectedAnswers
      });

      if (response.success) {
        setScore(response.data || 0);
        setCorrectAnswers(Math.round((response.data || 0) * totalQuestions / 100));
        setShowFeedback(true);
      } else {
        toast.error(response.error || 'Erro ao finalizar simulado');
      }
    } catch (error) {
      toast.error('Erro ao finalizar simulado');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Barra superior */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/estudos/simulados')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Sair
          </Button>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="font-mono text-lg">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Questão {currentQuestion + 1} de {totalQuestions}
          </div>
        </div>
      </div>

      {/* Navegação lateral */}
      <QuestionNavigation
        totalQuestions={totalQuestions}
        currentQuestion={currentQuestion}
        answeredQuestions={selectedAnswers}
        questionIds={simulado.questions.map(q => q.id)}
        onSelectQuestion={handleSelectQuestion}
      />

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 pt-24 pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Enunciado */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-medium mb-4">{currentQuestionData.statement}</h2>
            
            {/* Alternativas */}
            <div className="space-y-3">
              {currentQuestionData.alternatives.map((alternative, index) => (
                <button
                  key={alternative.id}
                  onClick={() => handleSelectAlternative(currentQuestionData.id, index)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedAnswers[currentQuestionData.id] === index
                      ? 'bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-700'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)})</span>
                  {alternative.text}
                </button>
              ))}
            </div>
          </div>

          {/* Navegação */}
          <div className="flex justify-between">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            {currentQuestion === totalQuestions - 1 ? (
              <Button onClick={handleFinishSimulado} className="bg-green-600 hover:bg-green-700">
                Finalizar Simulado
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="gap-2">
                Próxima
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Feedback */}
      <SimuladoFeedback
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        score={score}
        totalQuestions={totalQuestions}
        correctAnswers={correctAnswers}
        timeSpent={timeSpent}
      />
    </div>
  );
} 