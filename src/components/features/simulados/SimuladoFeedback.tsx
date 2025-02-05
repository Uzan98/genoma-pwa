import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, Target } from 'lucide-react';

interface SimuladoFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}

export function SimuladoFeedback({
  isOpen,
  onClose,
  score,
  totalQuestions,
  correctAnswers,
  timeSpent
}: SimuladoFeedbackProps) {
  const router = useRouter();

  function handleBackToList() {
    router.push('/estudos/simulados');
  }

  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Simulado Finalizado!</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          {/* Pontuação */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {score.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sua pontuação
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">Acertos</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{correctAnswers}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  de {totalQuestions}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">Tempo</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{minutes}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  min {seconds}s
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleBackToList} className="w-full">
            Voltar para Lista
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 