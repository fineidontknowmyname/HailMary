import React, { useState } from 'react';
import { X, Send, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Intel } from '@hailmary/types';

interface DoubtSolverModalProps {
  intel: Intel;
  onClose: () => void;
}

export function DoubtSolverModal({ intel, onClose }: DoubtSolverModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await api.post<string>('/api/ai/doubt', {
        intelId: intel.id,
        question: question.trim(),
        context: {
          title: intel.title,
          description: intel.description,
          tags: intel.tags
        }
      });
      
      setAnswer(response);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to AI core.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111520] border border-[#1e2535] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl shadow-[#4fffb0]/5">
        
        <div className="flex items-center justify-between p-5 border-b border-[#1e2535] bg-[#0b0e14]">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-[#4fffb0]" />
            <div>
              <h3 className="font-bold text-white tracking-tight">AI Doubt Solver</h3>
              <p className="text-xs text-[#7a849a] font-mono truncate max-w-md">
                Context: {intel.title}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#7a849a] hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow bg-[#0b0e14]/50 custom-scrollbar">
          {!answer && !isLoading && !error && (
            <div className="text-center py-12 text-[#7a849a] font-mono text-sm">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
              What concept from this material is unclear?
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-[#4fffb0]">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <span className="font-mono text-xs animate-pulse">Analyzing context & generating response...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-mono leading-relaxed">{error}</p>
            </div>
          )}

          {answer && (
            <div className="bg-[#161b27] border border-[#1e2535] rounded-xl p-5 shadow-inner">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {answer}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#1e2535] bg-[#0b0e14]">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a specific question..."
              disabled={isLoading}
              className="w-full bg-[#111520] border border-[#1e2535] rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-[#7a849a] focus:outline-none focus:border-[#4fffb0] disabled:opacity-50 transition-colors font-mono"
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#4fffb0] hover:bg-[#4fffb0]/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}