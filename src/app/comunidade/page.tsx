'use client';

import { Users, MessageSquare, Heart, Share2, Send } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useSidebarContext } from '@/contexts/SidebarContext';

// Dados mockados para exemplo inicial
const mockPosts = [
  {
    id: '1',
    user: {
      name: 'Ana Silva',
      avatar: '👩‍🎓',
      role: 'Estudante'
    },
    content: 'Acabei de terminar um simulado de Matemática! Consegui 90% de acertos! 🎉',
    likes: 24,
    comments: 8,
    time: '2h atrás'
  },
  {
    id: '2',
    user: {
      name: 'Pedro Santos',
      avatar: '👨‍🎓',
      role: 'Monitor'
    },
    content: 'Dica de estudo: Criar mapas mentais ajuda muito na memorização de conceitos complexos. Aqui está um exemplo que fiz para Biologia Celular.',
    likes: 45,
    comments: 12,
    time: '4h atrás'
  }
];

const mockTopUsers = [
  { id: '1', name: 'Ana Silva', avatar: '👩‍🎓', points: 1250 },
  { id: '2', name: 'Pedro Santos', avatar: '👨‍🎓', points: 980 },
  { id: '3', name: 'Maria Costa', avatar: '👩‍🎓', points: 875 }
];

export default function ComunidadePage() {
  const { isCollapsed } = useSidebarContext();
  const [newPost, setNewPost] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <main className="container mx-auto px-8 py-12">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Comunidade
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Compartilhe suas conquistas e aprenda com outros estudantes
            </p>
          </div>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feed Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Criar Post */}
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center text-2xl bg-purple-100 dark:bg-purple-900/50 rounded-full">
                    👤
                  </div>
                  <textarea
                    className="flex-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Compartilhe algo com a comunidade..."
                    rows={3}
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    <Send className="w-4 h-4" />
                    Publicar
                  </button>
                </div>
              </div>

              {/* Posts */}
              {mockPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700"
                >
                  {/* Cabeçalho do Post */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center text-2xl bg-purple-100 dark:bg-purple-900/50 rounded-full">
                      {post.user.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {post.user.name}
                        </h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          • {post.user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {post.time}
                      </p>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {post.content}
                  </p>

                  {/* Ações */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                      <Heart className="w-5 h-5" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                      <MessageSquare className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
                      <Share2 className="w-5 h-5" />
                      Compartilhar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Direita */}
            <div className="space-y-6">
              {/* Top Usuários */}
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-6">Top Contribuidores</h2>
                <div className="space-y-4">
                  {mockTopUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center text-2xl bg-purple-100 dark:bg-purple-900/50 rounded-full">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            {user.points} pontos
                          </p>
                        </div>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 font-medium">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estatísticas */}
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-6">Estatísticas</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Membros</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Posts</span>
                    <span className="font-medium">5,678</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Comentários</span>
                    <span className="font-medium">12,345</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 