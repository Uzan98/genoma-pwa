import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="relative group">
      {/* Efeito de hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
      
      {/* Card */}
      <div className="relative flex items-center gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
        {/* Ícone */}
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
          {icon}
        </div>

        {/* Conteúdo */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold mt-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
} 