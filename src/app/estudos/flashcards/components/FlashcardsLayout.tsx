'use client';

import { ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useSidebarContext } from '@/contexts/SidebarContext';

interface FlashcardsLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  actions?: React.ReactNode;
}

export function FlashcardsLayout({
  children,
  title,
  subtitle,
  showBackButton = true,
  backUrl = '/estudos/flashcards',
  actions
}: FlashcardsLayoutProps) {
  const { isCollapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {showBackButton && (
                  <button
                    onClick={() => window.location.href = backUrl}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Voltar"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
} 