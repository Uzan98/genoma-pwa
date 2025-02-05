'use client';

import { useEffect, useState } from 'react';
import { Simulado } from '@/db/queries';
import { SimuladoCard } from '@/components/features/simulados/SimuladoCard';
import { getSimuladosAction } from '../actions';

export default function SimuladosList() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSimulados() {
      try {
        const response = await getSimuladosAction();
        if (response.success && response.data) {
          setSimulados(response.data);
        } else {
          setError(response.error || 'Erro ao carregar simulados');
        }
      } catch (err) {
        setError('Erro ao carregar simulados');
      } finally {
        setIsLoading(false);
      }
    }

    loadSimulados();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 animate-pulse h-48 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (simulados.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Nenhum simulado encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {simulados.map((simulado) => (
        <SimuladoCard key={simulado.id} simulado={simulado} />
      ))}
    </div>
  );
} 