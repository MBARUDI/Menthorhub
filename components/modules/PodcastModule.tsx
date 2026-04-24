import React, { useState } from 'react';
import { Play, X, Mic } from 'lucide-react';

interface Video {
  id: string;
  title: string;
}

const PodcastModule: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const videos: Video[] = [
    { id: 'aa1STnFahjo', title: 'Podcast - Episódio Principal' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 shrink-0 flex items-center gap-2">
        <Mic className="text-purple-500" size={24} />
        <div>
          <h2 className="text-lg font-bold leading-tight">Podcast Hub</h2>
          <p className="text-xs text-gray-400">Áudios e Conversas</p>
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
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800 mb-2 shadow-lg border border-gray-700 group-hover:border-purple-500/50 transition-all">
                <img 
                  src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} 
                  alt={video.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <div className="bg-purple-500/90 rounded-full p-2 shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
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

export default PodcastModule;