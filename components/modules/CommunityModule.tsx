import React, { useState, useRef, useEffect } from 'react';
import { Users, MessageSquare, Heart, Send, User as UserIcon, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { generateChatResponse } from '../../services/geminiService';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  isAi?: boolean;
}

interface Post {
  id: string;
  author: string;
  avatarColor: string;
  content: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: 'Carlos Silva',
    avatarColor: 'bg-blue-600',
    content: 'Alguém já terminou o curso de Liderança Ágil? Estou achando incrível as dicas sobre feedback contínuo!',
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    likes: 5,
    comments: [
      {
        id: 'c1',
        author: 'Ana Paula',
        content: 'Sim! A parte sobre rituais de gestão mudou minha rotina.',
        timestamp: Date.now() - 3500000
      }
    ]
  },
  {
    id: '2',
    author: 'Eng. Roberto',
    avatarColor: 'bg-orange-600',
    content: 'Dica rápida sobre a NR-35: Lembrem-se sempre de verificar a validade do CA dos cinturões de segurança antes do uso. Segurança em primeiro lugar!',
    timestamp: Date.now() - 86400000, // 1 day ago
    likes: 12,
    comments: []
  }
];

const CommunityModule: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    const newPostId = Date.now().toString();
    
    // Create User Post
    const userPost: Post = {
      id: newPostId,
      author: 'Você',
      avatarColor: 'bg-emerald-600',
      content: newPostContent,
      timestamp: Date.now(),
      likes: 0,
      comments: []
    };

    // Add to top of feed
    setPosts(prev => [userPost, ...prev]);
    setNewPostContent('');

    // Generate AI Reply pretending to be a community member
    try {
      const aiResponse = await generateChatResponse(
        [{ role: 'user', text: newPostContent, timestamp: Date.now() }],
        "You are a helpful and friendly community member of 'MentorhubAI'. A user just posted in the community forum. Reply to them with a helpful, encouraging, or insightful comment related to their post. Keep it short (under 30 words). Act like a human peer or a mentor."
      );

      const aiComment: Comment = {
        id: `ai-${Date.now()}`,
        author: 'MentorBot',
        content: aiResponse,
        timestamp: Date.now(),
        isAi: true
      };

      // Add comment after a small delay to simulate typing
      setTimeout(() => {
        setPosts(prev => prev.map(p => {
          if (p.id === newPostId) {
            return { ...p, comments: [...p.comments, aiComment] };
          }
          return p;
        }));
      }, 2000);

    } catch (error) {
      console.error("Failed to generate AI reply", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-800 shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">Comunidade</h2>
            <p className="text-xs text-gray-400">Troque ideias e experiências</p>
          </div>
        </div>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-gray-900"></div>
          <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-gray-900"></div>
          <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold">+1k</div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* New Post Input */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <UserIcon size={20} />
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="No que você está pensando? Tire uma dúvida ou compartilhe uma conquista..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none h-20 placeholder-gray-500 text-white"
            />
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700/50">
            <span className="text-xs text-gray-500">Seja gentil e respeitoso.</span>
            <button
              onClick={handlePost}
              disabled={!newPostContent.trim() || isPosting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {isPosting ? 'Publicando...' : <>Publicar <Send size={14} /></>}
            </button>
          </div>
        </div>

        {/* Posts List */}
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-800 rounded-xl p-4 shadow-md border border-gray-700/50 animate-slide-up">
            {/* Post Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full ${post.avatarColor} flex items-center justify-center shrink-0`}>
                  <span className="font-bold text-sm">{post.author.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-200">{post.author}</h3>
                  <p className="text-xs text-gray-500">{formatTime(post.timestamp)}</p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-white">
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Post Content */}
            <p className="text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-6 text-gray-500 text-sm border-t border-gray-700/50 pt-3 mb-3">
              <button 
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-2 hover:text-red-400 transition-colors"
              >
                <Heart size={16} /> {post.likes}
              </button>
              <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <MessageSquare size={16} /> {post.comments.length}
              </button>
            </div>

            {/* Comments Section */}
            {post.comments.length > 0 && (
              <div className="bg-gray-900/50 rounded-lg p-3 space-y-3">
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className={`w-6 h-6 rounded-full ${comment.isAi ? 'bg-indigo-500' : 'bg-gray-600'} flex items-center justify-center shrink-0`}>
                       {comment.isAi ? <Users size={12} /> : <span className="text-xs">{comment.author.charAt(0)}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${comment.isAi ? 'text-indigo-400' : 'text-gray-300'}`}>
                          {comment.author}
                        </span>
                        {comment.isAi && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1 rounded">BOT</span>}
                        <span className="text-[10px] text-gray-600">{formatTime(comment.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-400">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <div className="text-center text-xs text-gray-600 py-4">
          Fim das publicações recentes
        </div>
      </div>
    </div>
  );
};

export default CommunityModule;