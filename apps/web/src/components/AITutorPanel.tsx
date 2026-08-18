import { useState, useRef, useEffect } from 'react';
import type { Intel } from '@hailmary/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorPanelProps {
  resource: Intel;
  user: any;
  onClose: () => void;
}

export default function AITutorPanel({ resource, user, onClose }: AITutorPanelProps) {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sessions/ai-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          resource_id: resource.id,
          resource_title: resource.title,
          user_message: userMessage
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.ai_response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain. Please try again." }]);
      }
    } catch (error) {
      console.error("AI Tutor Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#13161e] border-l border-gray-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1e2535]">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span className="text-xl">🤖</span> AI Tutor
          </h3>
          <p className="text-xs text-green-500 truncate max-w-[250px]">{resource.title}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-green-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
              }`}
            >
              {/* Very basic markdown rendering for bold text and code, assuming plain text normally */}
              {msg.content.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ 
                  __html: line
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`(.*?)`/g, '<code class="bg-black/30 px-1 py-0.5 rounded font-mono text-xs">$1</code>')
                }} />
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-[#1a1f2e]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your question..."
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-green-600"
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
