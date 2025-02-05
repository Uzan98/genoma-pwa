'use client';

import { useState } from 'react';

interface DayData {
  date: string;
  count: number;
}

interface StudyHeatmapProps {
  data: DayData[];
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function StudyHeatmap({ data }: StudyHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Organiza os dados por semana para criar o grid
  const getWeeksData = () => {
    const today = new Date();
    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    // Gera os últimos 91 dias (13 semanas)
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = data.find(d => d.date === dateStr) || {
        date: dateStr,
        count: 0
      };

      currentWeek.push(dayData);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600';
    if (count === 1) return 'bg-purple-200 dark:bg-purple-900/70 hover:bg-purple-300 dark:hover:bg-purple-800 border border-purple-300 dark:border-purple-800';
    if (count === 2) return 'bg-purple-400 dark:bg-purple-700 hover:bg-purple-500 dark:hover:bg-purple-600 border border-purple-500 dark:border-purple-600';
    return 'bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400 border border-purple-700 dark:border-purple-400';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${DAYS_OF_WEEK[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
  };

  const getMonthLabels = (weeks: DayData[][]) => {
    const labels: { month: string; offset: number }[] = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const date = new Date(week[0].date);
      const month = date.getMonth();

      if (month !== currentMonth) {
        labels.push({
          month: MONTHS[month],
          offset: weekIndex * 20
        });
        currentMonth = month;
      }
    });

    return labels;
  };

  const weeks = getWeeksData();
  const monthLabels = getMonthLabels(weeks);

  return (
    <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10" />
      
      <div className="relative">
        <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Streak de Estudos
        </h3>

        {/* Meses */}
        <div className="flex mb-8 relative">
          {monthLabels.map((label, i) => (
            <div
              key={`month-${i}`}
              className="absolute text-sm font-medium text-gray-600 dark:text-gray-300"
              style={{ left: `${label.offset}px` }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Grid de contribuições */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="flex gap-1.5 pb-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`
                      w-3.5 h-3.5 rounded-[3px]
                      transition-all duration-300 ease-in-out
                      hover:scale-110 hover:shadow-lg
                      ${getColorClass(day.count)}
                    `}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    title={`${formatDate(day.date)}: ${day.count} horas estudadas`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">Contribuições:</span>
          {[
            { count: 0, label: '0h' },
            { count: 1, label: '1-2h' },
            { count: 2, label: '3-4h' },
            { count: 3, label: '5h+' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/30 dark:bg-gray-800/30 px-2 py-1 rounded-md">
              <div className={`w-3 h-3 rounded-[3px] ${getColorClass(item.count)}`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 