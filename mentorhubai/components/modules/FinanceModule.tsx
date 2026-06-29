import React, { useState } from 'react';
import { TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { generateChatResponse } from '../../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const FinanceModule: React.FC = () => {
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Mock data for visualization aesthetic
  const data = [
    { name: 'Jan', savings: 400 },
    { name: 'Feb', savings: 600 },
    { name: 'Mar', savings: 550 },
    { name: 'Apr', savings: 800 },
    { name: 'May', savings: 1200 },
  ];

  const handleAnalyze = async () => {
    if (!query) return;
    setLoading(true);
    const systemInstruction = "You are an expert financial advisor. Provide concise, actionable advice based on the user's query. Focus on principles of saving, investing, and risk management. Use bullet points.";
    
    const response = await generateChatResponse([{ role: 'user', text: query, timestamp: Date.now() }], systemInstruction);
    setAdvice(response);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-y-auto pb-20">
      <div className="bg-gradient-to-b from-green-900 to-gray-900 p-6 pb-10">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <TrendingUp className="text-green-400" /> Finance Hub
        </h1>
        <p className="text-gray-400 text-sm">AI-Powered Wealth Management Advice</p>
      </div>

      <div className="px-4 -mt-8">
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 mb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Projected Growth</p>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <DollarSign size={20} className="text-green-500" /> 12,450
              </h3>
            </div>
            <span className="text-green-400 text-sm font-bold">+14%</span>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#4ade80' }}
                />
                <Bar dataKey="savings" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <PieChart size={18} className="text-purple-400" /> Ask Advisor
          </h3>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., How should I diversify $5,000 for long-term growth?"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !query}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing Market Data...' : 'Get AI Advice'}
          </button>

          {advice && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mt-4 animate-slide-up">
              <div className="flex items-center gap-2 mb-2 text-green-400">
                <BarChart3 size={16} />
                <span className="text-xs font-bold uppercase">Analysis Result</span>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {advice}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceModule;
