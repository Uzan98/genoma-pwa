'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Book, Brain, Layers, Library, Users, Menu, ChevronLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebarContext } from '@/contexts/SidebarContext';

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebarContext();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      id: 'estudos',
      label: 'Estudos',
      icon: Book,
      submenu: [
        {
          label: 'Simulados',
          href: '/estudos/simulados',
          icon: Brain,
        },
        {
          label: 'Flashcards',
          href: '/estudos/flashcards',
          icon: Layers,
        },
      ],
    },
    {
      id: 'biblioteca',
      label: 'Biblioteca de Estudos',
      href: '/biblioteca',
      icon: Library,
    },
    {
      id: 'comunidade',
      label: 'Comunidade',
      href: '/comunidade',
      icon: Users,
    },
  ];

  // Verifica se o item atual está ativo
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Verifica se algum submenu está ativo
  const hasActiveSubmenu = (item: typeof menuItems[0]) => {
    if ('submenu' in item) {
      return item.submenu?.some(subitem => isActive(subitem.href));
    }
    return false;
  };

  // Função para lidar com o clique nos itens do menu
  const handleItemClick = (href: string) => {
    router.push(href);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Genoma
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isItemActive = isActive(item.href || '') || hasActiveSubmenu(item);
              
              return (
                <li key={item.id}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => setExpandedMenu(expandedMenu === item.id ? null : item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                          isItemActive
                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span>{item.label}</span>
                            <span className="ml-auto">
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  expandedMenu === item.id ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </span>
                          </>
                        )}
                      </button>
                      {!isCollapsed && expandedMenu === item.id && (
                        <ul className="mt-2 ml-6 space-y-2">
                          {item.submenu.map((subitem) => {
                            const isSubItemActive = isActive(subitem.href);
                            
                            return (
                              <li key={subitem.href}>
                                <button
                                  onClick={() => handleItemClick(subitem.href)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                                    isSubItemActive
                                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  <subitem.icon className="w-4 h-4 shrink-0" />
                                  <span>{subitem.label}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleItemClick(item.href)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        isItemActive
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
} 