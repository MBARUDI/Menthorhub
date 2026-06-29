import React, { useState } from 'react';
import { Play, X, Film, Crown } from 'lucide-react';

interface Video {
  id: string;
  title: string;
}

const LeadershipModule: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // List of videos with generated titles for alphabetical sorting
  const videos: Video[] = [
    { id: '4PbNwbieo7Y', title: 'A Arte da Liderança' },
    { id: 'kvN3nBTSOns', title: 'Comunicação Assertiva' },
    { id: 'CUVqfy2ip4c', title: 'Construindo Confiança' },
    { id: 'xklioolzovY', title: 'Cultura Organizacional' },
    { id: 'Val55Wmxxfw', title: 'Delegação de Tarefas' },
    { id: 'vX-aGm8HN9w', title: 'Desenvolvimento de Equipes' },
    { id: 'HCanaNpKmQg', title: 'Estratégias de Gestão' },
    { id: 'A0sL248FAog', title: 'Feedback Construtivo' },
    { id: 'jB4otr_XTL4', title: 'Gestão de Conflitos' },
    { id: '2lOPa2CdaSs', title: 'Gestão do Tempo' },
    { id: 'NwnA-87i5VQ', title: 'Inovação e Mudança' },
    { id: '2m-vjviZkxA', title: 'Inteligência Emocional' },
    { id: 'YeX4Ke1GOcc', title: 'Liderança Ágil' },
    { id: '34JRtyY1XLg', title: 'Liderança Situacional' },
    { id: 'qb5LtSlDDrg', title: 'Mentoria Eficaz' },
    { id: 'Uc7gHvrgUvY', title: 'Motivação e Engajamento' },
    { id: 'xFyFRW_lIis', title: 'Planejamento Estratégico' },
    { id: 'fBJ-4G28fM0', title: 'Resiliência Profissional' },
    { id: 'I9vxn6yp9xs', title: 'Tomada de Decisão' },
    { id: 'STnpThc5PQs', title: 'Visão Sistêmica' },
  ].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 shrink-0 flex items-center gap-2">
        <Crown className="text-yellow-500" size={24} />
        <div>
          <h2 className="text-lg font-bold leading-tight">Leadership Mentor</h2>
          <p className="text-xs text-gray-400">Biblioteca de Vídeos Exclusiva</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Video Player Overlay */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative">
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h3 className="text-white font-medium truncate pr-4">{activeVideo.title}</h3>
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400 hover:text-white" />
                </button>
              </div>
              <div className="relative pt-[56.25%] bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group flex flex-col items-start text-left"
            >
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800 mb-2 shadow-lg border border-gray-700 group-hover:border-yellow-500/50 transition-all">
                <img 
                  src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} 
                  alt={video.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <div className="bg-yellow-500/90 rounded-full p-2 shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                    <Play size={20} fill="white" className="text-white" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded text-white font-medium">
                  YouTube
                </div>
              </div>
              <h4 className="text-sm font-medium text-gray-300 group-hover:text-white line-clamp-2 leading-snug">
                {video.title}
              </h4>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadershipModule;