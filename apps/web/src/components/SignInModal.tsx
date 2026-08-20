import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../auth/authStore';
import { backdropVariants, modalVariants, modalTransition } from '../lib/motion';
import { FONT_DISPLAY } from '../lib/theme';
import { useAppTheme } from '../lib/ThemeProvider';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'signup' | 'login';

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { theme } = useAppTheme();
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const signIn = useAuthStore(s => s.signIn);
  const signUp = useAuthStore(s => s.signUp);

  // Reset state whenever modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setSuccessMsg(null);
      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen]);

  // Clear errors when switching mode
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
  }, [mode]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const modalRef = useModalFocusTrap<HTMLDivElement>(isOpen);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        const result = await signUp(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccessMsg('Check your email to confirm your account, then log in.');
          setPassword('');
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          handleClose();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('[SignInModal] Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
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
      // On success, Supabase handles the redirect — loading stays true
    } catch (err) {
      setError('Failed to start Google sign-in. Please try again.');
      setLoading(false);
      console.error('[SignInModal] Google auth error:', err);
    }
  };

  if (!isOpen) return null;

  const isSignUp = mode === 'signup';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      variants={backdropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.18 }}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-[420px] mx-4 overflow-hidden rounded-2xl border backdrop-blur-xl"
        style={{ borderColor: theme.cardBorder, background: theme.bgPanel, boxShadow: theme.shadowPanel }}
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={modalTransition}
      >
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{ color: theme.muted }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="relative px-8 pt-8 pb-8">
          <div className="flex justify-center mb-7">
            <div className="inline-flex rounded-full p-1" style={{ background: theme.bgBase, border: `1px solid ${theme.cardBorder}` }}>
              <button
                onClick={() => setMode('signup')}
                className="relative z-10 rounded-full px-5 py-2 text-xs font-bold tracking-wide transition-all duration-200"
                style={isSignUp ? { background: theme.accentText, color: theme.bgBase } : { color: theme.muted }}
              >
                Sign Up
              </button>
              <button
                onClick={() => setMode('login')}
                className="relative z-10 rounded-full px-5 py-2 text-xs font-bold tracking-wide transition-all duration-200"
                style={!isSignUp ? { background: theme.accentText, color: theme.bgBase } : { color: theme.muted }}
              >
                Log In
              </button>
            </div>
          </div>

          <div className="text-center mb-7">
            <h2 id="auth-modal-title" className="text-2xl font-bold mb-1.5" style={{ color: theme.heading, fontFamily: FONT_DISPLAY }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm" style={{ color: theme.muted }}>
              {isSignUp
                ? 'Create a free account to continue.'
                : 'Log in to your account to continue.'}
            </p>
          </div>

          {/* ── Success message ── */}
          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <p className="text-xs text-emerald-300 leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* ── Error message ── */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
              </svg>
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleManualAuth} className="space-y-4">
            {/* Email */}
            <div className="group relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: theme.dim }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path strokeLinecap="round" d="m2 7 10 6 10-6" />
                </svg>
              </div>
              <label htmlFor="auth-email" className="sr-only">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                placeholder="you@email.com"
                className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all"
                style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.heading }}
              />
            </div>

            {/* Password */}
            <div className="group relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: theme.dim }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="3" />
                  <path strokeLinecap="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <label htmlFor="auth-password" className="sr-only">Password</label>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder={isSignUp ? 'Create a password' : 'Your password'}
                minLength={6}
                className="w-full rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all"
                style={{ border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.heading }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: theme.dim }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: theme.accentText, color: theme.bgBase }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isSignUp ? 'Creating account…' : 'Logging in…'}
                  </>
                ) : (
                  isSignUp ? 'Continue' : 'Log In'
                )}
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: theme.cardBorder }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: theme.dim }}>or</span>
            <div className="flex-1 h-px" style={{ background: theme.cardBorder }} />
          </div>

          {/* ── Google OAuth ── */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-3 rounded-xl border py-3 text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: theme.cardBorder, background: theme.bgBase, color: theme.heading }}
          >
            {/* Google logo */}
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          {/* ── Footer note ── */}
          <p className="mt-6 text-center text-[10px] leading-relaxed" style={{ color: theme.dim }}>
            By continuing, you agree to HailMary's Terms of Service.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
