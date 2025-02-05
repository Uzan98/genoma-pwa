interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface CommunityNoticesProps {
  notices: Notice[];
}

export function CommunityNotices({ notices }: CommunityNoticesProps) {
  return (
    <div className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10" />
      
      <div className="relative">
        <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Avisos da Comunidade
        </h3>

        <div className="space-y-6">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="group relative bg-white/30 dark:bg-gray-800/30 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              {/* Efeito de hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
              
              {/* Conteúdo */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    {notice.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                    {notice.date}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {notice.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 