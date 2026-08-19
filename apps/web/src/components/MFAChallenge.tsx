import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useAppTheme } from '../lib/ThemeProvider';

interface Props {
  onSuccess: () => void;
}

export function MFAChallenge({ onSuccess }: Props) {
  const { session } = useAuth();
  const { theme } = useAppTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    try {
      setLoading(true);

      const factors = session?.user?.factors || [];
      const totpFactor = factors.find(f => f.factor_type === 'totp' && f.status === 'verified');

      if (!totpFactor) {
        throw new Error('No verified TOTP factor found for this user.');
      }

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) {
        throw challengeError;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        throw verifyError;
      }

      onSuccess();
    } catch (err: any) {
      console.error('MFA Error:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div
        className="rounded-2xl w-full max-w-sm mx-4 p-8 relative border backdrop-blur-xl"
        style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
      >
        <div className="text-center mb-6">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4"
            style={{ background: theme.accentSoftBg }}
          >
            <svg
              className="h-6 w-6"
              style={{ color: theme.accentText }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: theme.heading }}>Two-Factor Authentication</h2>
          <p className="text-sm" style={{ color: theme.muted }}>
            Please enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono outline-none transition-all"
              style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: theme.accentText, color: theme.bgBase }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
