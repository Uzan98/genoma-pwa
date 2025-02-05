import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Record<string, number>;
  questionIds: string[];
  onSelectQuestion: (index: number) => void;
}

export function QuestionNavigation({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  questionIds,
  onSelectQuestion
}: QuestionNavigationProps) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-sm font-medium mb-3 text-gray-600 dark:text-gray-400">
        Questões
      </div>
      <div className="grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto p-1">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const questionId = questionIds[index];
          const isAnswered = questionId in answeredQuestions;
          const isCurrent = index === currentQuestion;

          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSelectQuestion(index)}
              className={cn(
                'w-10 h-10 p-0 font-mono',
                isAnswered && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                !isAnswered && !isCurrent && 'bg-gray-50 dark:bg-gray-900',
                isCurrent && 'ring-2 ring-purple-500 dark:ring-purple-400'
              )}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Respondida</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <span>Não respondida</span>
        </div>
      </div>
    </div>
  );
} 