import React, { useState } from 'react';
import { X, Send, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import type { Intel } from '@hailmary/types';
import { backdropVariants, modalVariants, modalTransition } from '../lib/motion';
import { useAppTheme } from '../lib/ThemeProvider';

interface DoubtSolverModalProps {
  intel: Intel;
  onClose: () => void;
}

export function DoubtSolverModal({ intel, onClose }: DoubtSolverModalProps) {
  const { theme } = useAppTheme();
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
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      variants={backdropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border backdrop-blur-xl"
        style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={modalTransition}
      >

        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: theme.cardBorder, background: theme.bgBase }}>
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5" style={{ color: theme.accentText }} />
            <div>
              <h3 className="font-bold tracking-tight" style={{ color: theme.heading }}>AI Doubt Solver</h3>
              <p className="text-xs font-mono truncate max-w-md" style={{ color: theme.muted }}>
                Context: {intel.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-colors p-1"
            style={{ color: theme.muted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow custom-scrollbar" style={{ background: theme.bgBase }}>
          {!answer && !isLoading && !error && (
            <div className="text-center py-12 font-mono text-sm" style={{ color: theme.muted }}>
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
              What concept from this material is unclear?
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: theme.accentText }}>
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
            <div className="rounded-xl p-5 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: theme.body }}>
                {answer}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t" style={{ borderColor: theme.cardBorder, background: theme.bgBase }}>
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a specific question..."
              disabled={isLoading}
              className="w-full rounded-xl pl-4 pr-12 py-3 text-sm outline-none disabled:opacity-50 transition-colors font-mono"
              style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg disabled:opacity-50 transition-colors"
              style={{ color: theme.accentText }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </motion.div>
    </motion.div>
  );
}
