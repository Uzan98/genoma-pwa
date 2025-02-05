'use client';

import { Clock, Book, Target, Plus, Calendar, Brain, Layers } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { StudyHeatmap } from '@/components/features/StudyHeatmap';
import Link from 'next/link';

// Dados mockados para exemplo inicial
const mockHeatmapData = Array.from({ length: 28 }, (_, i) => ({
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  count: Math.floor(Math.random() * 4)
}));

const mockSubjects = [
  { id: '1', name: 'Matemática', icon: '📐', totalHours: 24 },
  { id: '2', name: 'Física', icon: '⚡', totalHours: 18 },
  { id: '3', name: 'Química', icon: '🧪', totalHours: 12 },
  { id: '4', name: 'Biologia', icon: '🧬', totalHours: 20 },
];

export default function EstudosPage() {
  const { isCollapsed } = useSidebarContext();
  const [showAddHours, setShowAddHours] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <main className="container mx-auto px-8 py-12">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Meus Estudos
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gerencie seu tempo de estudo e acompanhe seu progresso
              </p>
            </div>
            <button
              onClick={() => setShowAddHours(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Registrar Horas
            </button>
          </div>

          {/* Grid de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Horas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">74h</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Matérias</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Meta Semanal</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">80%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ferramentas de Estudo */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Ferramentas de Estudo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card de Simulados */}
              <Link
                href="/estudos/simulados"
                className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Simulados</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Teste seus conhecimentos com simulados personalizados
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>12 simulados disponíveis</span>
                  <span>Média: 85%</span>
                </div>
              </Link>

              {/* Card de Flashcards */}
              <Link
                href="/estudos/flashcards"
                className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Flashcards</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Memorize conceitos com flashcards interativos
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>8 decks criados</span>
                  <span>120 cards no total</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Matérias */}
            <div className="lg:col-span-1">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Matérias</h2>
                <div className="space-y-4">
                  {mockSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{subject.icon}</span>
                        <span className="font-medium">{subject.name}</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {subject.totalHours}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Heatmap e Calendário */}
            <div className="lg:col-span-2">
              <StudyHeatmap data={mockHeatmapData} />
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Adicionar Horas (será implementado depois) */}
      {showAddHours && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Registrar Horas de Estudo</h2>
            {/* Formulário será implementado posteriormente */}
            <button
              onClick={() => setShowAddHours(false)}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg mt-4"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 