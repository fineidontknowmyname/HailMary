import { useState } from 'react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    // TODO: Connect Supabase/Auth login logic here
    console.log('Login attempt with:', { email, password });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#13161e] border border-[#1e2535] rounded-2xl w-full max-w-md mx-4 p-8 relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[#7a849a] hover:text-white transition-colors text-xl leading-none"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="font-black text-2xl mb-1 text-white">
            Sign In
          </div>
          <div className="text-[#7a849a] text-sm">
            Enter your credentials to continue
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#7a849a] mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0b0e14] border border-[#1e2535] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#4fffb0] focus:ring-1 focus:ring-[#4fffb0] transition-all"
              placeholder="astronaut@hailmary.dev"
            />
          </div>
          
          <div>
            <label className="block text-xs font-mono text-[#7a849a] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0b0e14] border border-[#1e2535] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#4fffb0] focus:ring-1 focus:ring-[#4fffb0] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-[#4fffb0] text-[#0b0e14] font-bold py-3 rounded-xl text-sm hover:bg-[#3de89e] active:scale-[0.98] transition-all"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
