'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Question {
  statement: string;
  correctAlternative: number;
  alternatives: string[];
}

interface CreateSimuladoModalProps {
  onSubmitAction: (formData: FormData) => Promise<{ success: boolean; error?: string; data?: string }>;
}

export function CreateSimuladoModal({ onSubmitAction }: CreateSimuladoModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    statement: '',
    correctAlternative: 0,
    alternatives: ['', '', '', '']
  });

  function handleAddQuestion() {
    if (!currentQuestion.statement || currentQuestion.alternatives.some(alt => !alt)) {
      toast.error('Preencha todos os campos da questão');
      return;
    }
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      statement: '',
      correctAlternative: 0,
      alternatives: ['', '', '', '']
    });
  }

  function handleRemoveQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (questions.length === 0) {
      toast.error('Adicione pelo menos uma questão');
      return;
    }
    
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.append('questions', JSON.stringify(questions));
      
      const response = await onSubmitAction(formData);
      
      if (response.success) {
        setIsOpen(false);
        toast.success('Simulado criado com sucesso!');
        setQuestions([]);
        setCurrentQuestion({
          statement: '',
          correctAlternative: 0,
          alternatives: ['', '', '', '']
        });
        router.refresh();
      } else {
        toast.error(response.error || 'Erro ao criar simulado');
      }
    } catch (error) {
      toast.error('Erro ao criar simulado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Criar Simulado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Simulado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas do simulado */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Digite o título do simulado"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Digite a descrição do simulado"
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Tempo (minutos)</Label>
              <Input
                id="time"
                name="time"
                type="number"
                min="1"
                placeholder="Digite o tempo em minutos"
                required
              />
            </div>
            <div>
              <Label htmlFor="isPublic">
                <Input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  className="mr-2"
                  value="on"
                />
                Tornar público
              </Label>
            </div>
          </div>

          {/* Seção de questões */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Questões</h3>
            
            {/* Lista de questões já adicionadas */}
            {questions.length > 0 && (
              <div className="mb-6 space-y-4">
                <h4 className="font-medium">Questões Adicionadas:</h4>
                {questions.map((q, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Questão {index + 1}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{q.statement}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulário para adicionar nova questão */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="statement">Enunciado da Questão</Label>
                <Textarea
                  id="statement"
                  value={currentQuestion.statement}
                  onChange={(e) => setCurrentQuestion({
                    ...currentQuestion,
                    statement: e.target.value
                  })}
                  placeholder="Digite o enunciado da questão"
                />
              </div>

              <div className="space-y-3">
                <Label>Alternativas</Label>
                {currentQuestion.alternatives.map((alt, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={alt}
                      onChange={(e) => {
                        const newAlternatives = [...currentQuestion.alternatives];
                        newAlternatives[index] = e.target.value;
                        setCurrentQuestion({
                          ...currentQuestion,
                          alternatives: newAlternatives
                        });
                      }}
                      placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={currentQuestion.correctAlternative === index ? 'bg-green-100' : ''}
                      onClick={() => setCurrentQuestion({
                        ...currentQuestion,
                        correctAlternative: index
                      })}
                    >
                      Correta
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddQuestion}
                className="w-full"
              >
                Adicionar Questão
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading || questions.length === 0}>
            {isLoading ? 'Criando...' : 'Criar Simulado'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 