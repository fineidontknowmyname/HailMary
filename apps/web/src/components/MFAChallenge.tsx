import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

interface Props {
  onSuccess: () => void;
}

export function MFAChallenge({ onSuccess }: Props) {
  const { session } = useAuth();
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

      // Find the enrolled TOTP factor from the session
      const factors = session?.user?.factors || [];
      const totpFactor = factors.find(f => f.factor_type === 'totp' && f.status === 'verified');

      if (!totpFactor) {
        throw new Error('No verified TOTP factor found for this user.');
      }

      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) {
        throw challengeError;
      }

      // Verify the challenge with the entered code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        throw verifyError;
      }

      // Success! Dismiss the modal.
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
      <div className="bg-zinc-900 border border-[#1e2535] rounded-2xl w-full max-w-sm mx-4 p-8 relative shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4fffb0]/10 mb-4">
            <svg
              className="h-6 w-6 text-[#4fffb0]"
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
          <h2 className="text-xl font-bold text-white mb-2">Two-Factor Authentication</h2>
          <p className="text-[#7a849a] text-sm">
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
              className="w-full bg-[#0b0e14] border border-[#1e2535] rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono text-white placeholder-[#7a849a]/30 outline-none focus:border-[#4fffb0] focus:ring-2 focus:ring-[#4fffb0]/10 transition-all"
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
            className="w-full flex items-center justify-center gap-2 bg-[#4fffb0] text-[#0b0e14] font-bold py-3 rounded-xl text-sm hover:bg-[#3de89e] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
