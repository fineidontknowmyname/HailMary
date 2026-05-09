import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/profile';

export default function PortfolioPage() {
  const { user, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: profileError } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user!.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw new Error(profileError.message);
        }

        setProfile(data || {});
      } catch (err: any) {
        setError(err.message || 'Failed to load portfolio profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isLoggedIn, user]);

  const username = useMemo(() => {
    return (
      profile?.username ||
      user?.user_metadata?.username ||
      user?.email?.split('@')[0] ||
      'Maverick'
    );
  }, [profile?.username, user]);

  const backendUrl = import.meta.env.VITE_API_URL;
  const liveUrl = username ? `${backendUrl}/api/portfolio/${username}` : '';
  const shareableLink = `${import.meta.env.VITE_APP_URL}/${username}`;

  async function copyShareableLink() {
    await navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#13161e] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-white mb-3">Portfolio Control Center</h1>
        <p className="text-sm font-mono text-[#7a849a] mb-6 max-w-sm">
          Sign in to view your live portfolio link.
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
          className="px-6 py-3 rounded-lg text-sm font-bold bg-[#4fffb0] text-[#0b0e14]"
        >
          Initialize Session
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#13161e] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#4fffb0]" />
        <p className="text-sm font-mono text-[#7a849a]">Loading portfolio link...</p>
      </div>
    );
  }

  if (error || !liveUrl) {
    return (
      <div className="min-h-screen bg-[#13161e] flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-mono text-red-400 max-w-md">
          {error || 'Add a username in your profile to publish your portfolio.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] p-8 text-slate-200">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio Control Center</h1>
        <p className="text-slate-400 mb-8">Manage your backend-compiled portfolio engine.</p>

        <div className="bg-[#13161e] border border-[#252b3b] p-6 rounded-xl space-y-6">
          <div>
            <h3 className="text-emerald-400 font-semibold mb-2">Your Public Link</h3>
            <div className="flex flex-col gap-3 bg-black/30 p-3 rounded-lg border border-slate-800 sm:flex-row sm:items-center">
              <code className="text-slate-300 flex-1 break-all text-sm">{shareableLink}</code>
              <button
                onClick={copyShareableLink}
                className="inline-flex items-center justify-center gap-2 text-sm px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-white transition-colors"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
            >
              Preview Live Portfolio
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
