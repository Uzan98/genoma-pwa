'use client';

import { Clock, Target, Trophy, Sparkles } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { StudyHeatmap } from '@/components/features/StudyHeatmap';
import { CommunityNotices } from '@/components/features/CommunityNotices';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';
import { Sidebar } from '@/components/layout/Sidebar';
import { useSidebarContext } from '@/contexts/SidebarContext';

// Dados mockados para exemplo
const mockHeatmapData = Array.from({ length: 28 }, (_, i) => ({
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  count: Math.floor(Math.random() * 4)
}));

const mockNotices = [
  {
    id: '1',
    title: 'Novo Simulado Disponível',
    content: 'Um novo simulado sobre Genética foi adicionado à plataforma.',
    date: '2 horas atrás'
  },
  {
    id: '2',
    title: 'Atualização do Sistema',
    content: 'Novas funcionalidades foram adicionadas ao módulo de flashcards.',
    date: '1 dia atrás'
  }
];

export default function Home() {
  const { isCollapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Efeito de partículas */}
        <ParticlesBackground />
        
        {/* Gradiente de fundo */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10 pointer-events-none" />
        
        <main className="relative container mx-auto px-8 py-12">
          {/* Cabeçalho */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/30 mb-6">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Plataforma de Estudos Inteligente
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-transparent bg-clip-text">
              Bem-vindo ao Genoma
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
              Acompanhe seu progresso, participe de simulados e estude com uma comunidade engajada.
            </p>
          </div>

          {/* Grid de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard
              title="Horas Estudadas"
              value="24h"
              icon={<Clock className="w-6 h-6" />}
            />
            <StatCard
              title="Acertos em Simulados"
              value="85%"
              icon={<Trophy className="w-6 h-6" />}
            />
            <StatCard
              title="Metas Concluídas"
              value="12/15"
              icon={<Target className="w-6 h-6" />}
            />
          </div>

          {/* Grid de Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Heatmap de Estudos */}
            <StudyHeatmap data={mockHeatmapData} />

            {/* Avisos da Comunidade */}
            <CommunityNotices notices={mockNotices} />
          </div>

          {/* Rodapé com Ações */}
          <div className="mt-12 flex flex-col items-center">
            <div className="inline-flex gap-4 p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
              <button className="px-6 py-2.5 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                Começar a Estudar
              </button>
              <button className="px-6 py-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Ver Simulados
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
