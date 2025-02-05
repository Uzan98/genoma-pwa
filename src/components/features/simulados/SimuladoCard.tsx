import { Brain, Clock, ArrowRight, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Simulado } from '@/db/queries';

interface SimuladoCardProps {
  simulado: Simulado;
}

export function SimuladoCard({ simulado }: SimuladoCardProps) {
  const router = useRouter();

  function handleStartSimulado() {
    router.push(`/estudos/simulados/${simulado.id}`);
  }

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {simulado.title}
        </h3>
        {simulado.isPublic && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Globe className="w-4 h-4" />
            <span>Público</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {simulado.description}
      </p>
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{simulado.time} min</span>
        </div>
      </div>
      <Button onClick={handleStartSimulado} className="w-full gap-2">
        Iniciar
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
} 