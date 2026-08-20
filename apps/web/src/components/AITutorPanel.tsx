import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import type { Intel } from '@hailmary/types';
import { api } from '../lib/api';
import { useAppTheme } from '../lib/ThemeProvider';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorPanelProps {
  resource: Intel;
  user: { id: string } | null;
  onClose: () => void;
}

interface AiTutorResponse {
  success: boolean;
  ai_response: string;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|`(.+?)`/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      parts.push(
        <code key={key++} className="bg-black/30 px-1 py-0.5 rounded font-mono text-xs">
          {match[2]}
        </code>
      );
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function AITutorPanel({ resource, user, onClose }: AITutorPanelProps) {
  const { theme } = useAppTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `I see you hit a wall with **${resource.title}**. What specific concept tripped you up?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !user) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const data = await api.post<AiTutorResponse>('/api/sessions/ai-tutor', {
        resource_id: resource.id,
        resource_title: resource.title,
        user_message: userMessage
      });

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.ai_response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain. Please try again." }]);
      }
    } catch (error) {
      console.error('AI Tutor Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 w-96 border-l z-50 flex flex-col transform transition-transform duration-300 backdrop-blur-xl"
      style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
    >

      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.cardBorder, background: theme.bgBase }}>
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: theme.heading }}>
            <span className="text-xl">🤖</span> AI Tutor
          </h3>
          <p className="text-xs truncate max-w-[250px]" style={{ color: theme.accentText }}>{resource.title}</p>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close AI tutor panel"
          className="transition-colors"
          style={{ color: theme.muted }}
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm border ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}
              style={msg.role === 'user'
                ? { background: theme.accentText, color: theme.bgBase, borderColor: theme.accentText }
                : { background: theme.cardBg, color: theme.body, borderColor: theme.cardBorder }}
            >
              {msg.content.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">{renderInlineMarkdown(line)}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl rounded-tl-none px-4 py-3 text-sm border flex items-center gap-2"
              style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.muted }}
            >
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: theme.dim }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: theme.dim, animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: theme.dim, animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: theme.cardBorder, background: theme.bgBase }}>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your question..."
            disabled={loading}
            className="w-full rounded-xl pl-4 pr-12 py-3 text-sm outline-none transition-all disabled:opacity-50"
            style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ background: theme.accentText, color: theme.bgBase }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
