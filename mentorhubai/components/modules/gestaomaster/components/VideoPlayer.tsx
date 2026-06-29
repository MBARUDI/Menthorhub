import React, { useEffect, useState } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  youtubeId: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeId, title }) => {
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
  const src = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1&controls=1${originParam}&enablejsapi=1`;

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group border border-slate-800">
        <iframe
          className="w-full h-full"
          src={src}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
      
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <AlertCircle size={14} />
          <span>Se o vídeo não carregar, use o link direto.</span>
        </div>
        <a 
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          <span>Assistir no YouTube</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

export default VideoPlayer;
