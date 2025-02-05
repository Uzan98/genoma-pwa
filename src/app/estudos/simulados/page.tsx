'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Trophy, Clock, Brain, Target } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { CreateSimuladoModal } from '@/components/features/simulados/CreateSimuladoModal';
import { createSimuladoAction, getSimuladosAction, getSimuladoHistoryAction } from './actions';
import { Simulado } from '@/db/queries';
import { SimuladoCard } from '@/components/features/simulados/SimuladoCard';
import SimuladosList from './components/SimuladosList';

interface Stats {
  total: number;
  totalTime: number;
  totalQuestions: number;
  accuracy: number;
}

interface SimuladoHistory {
  id: string;
  simuladoTitle: string;
  startedAt: Date;
  finishedAt: Date;
  score: number;
}

export default function SimuladosPage() {
  const { isCollapsed } = useSidebarContext();
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [history, setHistory] = useState<SimuladoHistory[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalTime: 0,
    totalQuestions: 0,
    accuracy: 0,
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const result = await getSimuladoHistoryAction();
    if (result.success && result.data) {
      setHistory(result.data);

      // Calcular estatísticas
      const totalAttempts = result.data.length;
      const totalTime = result.data.reduce((acc, attempt) => {
        const start = new Date(attempt.startedAt);
        const end = attempt.finishedAt ? new Date(attempt.finishedAt) : new Date();
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Converter para horas
      }, 0);

      setStats({
        total: totalAttempts,
        totalTime: Math.round(totalTime),
        totalQuestions: 0, // Será calculado quando tivermos acesso às questões
        accuracy: 0, // Será calculado quando tivermos acesso às respostas
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <main className="container mx-auto px-8 py-12">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Simulados
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Crie e responda simulados personalizados
              </p>
            </div>
            <CreateSimuladoModal onSubmitAction={createSimuladoAction} />
          </div>

          {/* Grid de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Simulados Feitos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTime}h</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Brain className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questões Respondidas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                  <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Acerto</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accuracy}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simulados Disponíveis */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Simulados Disponíveis
            </h2>
            <Suspense fallback={<div>Carregando simulados...</div>}>
              <SimuladosList />
            </Suspense>
          </section>

          {/* Histórico */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Histórico
            </h2>
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Simulado
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Data
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pontuação
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((attempt) => (
                    <tr
                      key={attempt.id}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <td className="p-4 text-gray-900 dark:text-white">{attempt.simuladoTitle}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {new Date(attempt.startedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {attempt.score}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
} 