import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2;

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleClose = () => {
    // Reset to initial state on close
    setStep(1);
    setEmail('');
    setPassword('');
    setError(null);
    onClose();
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setStep(2);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      handleClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (googleError) {
      setError(googleError.message);
      setLoading(false);
    }
    // On success, Supabase handles the redirect — no need to close manually
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#13161e] border border-[#1e2535] rounded-2xl w-full max-w-sm mx-4 p-8 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-[#7a849a] hover:text-white transition-colors text-xl leading-none"
        >
          ✕
        </button>

        {/* ── STEP 1: Email ── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Sign In</h1>
            <p className="text-[#7a849a] text-sm mb-8">Use your HailMary account</p>

            <form onSubmit={handleNextStep} className="space-y-6">
              {/* Email input — bottom border only */}
              <div className="relative">
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="Email or phone"
                  className="w-full bg-transparent border-0 border-b border-[#3a4255] pb-2 pt-1 text-white text-sm outline-none focus:border-[#4fffb0] transition-colors placeholder-[#4a5568]"
                />
              </div>

              {/* Helper links */}
              <div className="flex flex-col gap-1">
                <a href="#" className="text-[#4fffb0] text-xs hover:underline w-fit">
                  No account? Create one!
                </a>
                <a href="#" className="text-[#4fffb0] text-xs hover:underline w-fit">
                  Can't access your account?
                </a>
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              {/* Next button — right-aligned */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#4fffb0] text-[#0b0e14] font-bold px-6 py-2 rounded-lg text-sm hover:bg-[#3de89e] active:scale-[0.98] transition-all"
                >
                  Next
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#1e2535]" />
              <span className="text-[#7a849a] text-xs font-mono uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-[#1e2535]" />
            </div>

            {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#1c2030] border border-[#1e2535] hover:border-[#3a4255] text-white py-2.5 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {/* Google Logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* ── STEP 2: Password ── */}
        {step === 2 && (
          <div>
            {/* Back arrow + email chip */}
            <button
              onClick={() => { setStep(1); setError(null); }}
              className="flex items-center gap-2 text-[#7a849a] hover:text-white text-sm mb-6 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="bg-[#1c2030] border border-[#1e2535] rounded-full px-3 py-0.5 text-xs text-white font-mono truncate max-w-[220px]">
                {email}
              </span>
            </button>

            <h1 className="text-2xl font-bold text-white mb-1">Enter password</h1>
            <p className="text-[#7a849a] text-sm mb-8">for <span className="text-white">{email}</span></p>

            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Password input — bottom border only */}
              <div className="relative">
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  placeholder="Password"
                  className="w-full bg-transparent border-0 border-b border-[#3a4255] pb-2 pt-1 text-white text-sm outline-none focus:border-[#4fffb0] transition-colors placeholder-[#4a5568]"
                />
              </div>

              {/* Helper link */}
              <div>
                <a href="#" className="text-[#4fffb0] text-xs hover:underline">
                  Forgot my password
                </a>
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              {/* Sign In button — right-aligned */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#4fffb0] text-[#0b0e14] font-bold px-6 py-2 rounded-lg text-sm hover:bg-[#3de89e] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
