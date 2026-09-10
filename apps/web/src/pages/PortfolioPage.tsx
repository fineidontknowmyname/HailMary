import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Copy, ExternalLink, Loader2, User, Briefcase, Folder } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { fetchProfile, upsertProfile } from '../lib/profile';
import type { UserProfile } from '../types/profile';
import { InViewFade } from '../components/ui/InViewFade';
import { PORTFOLIO_THEMES, resolveThemeId } from '../components/portfolio-templates/types';
import { useAppTheme } from '../lib/ThemeProvider';

export default function PortfolioPage() {
  const { theme } = useAppTheme();
  const { user, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);

  const activeTheme = resolveThemeId(profile?.portfolio_theme);

  async function selectTheme(themeId: string) {
    if (!user || savingTheme || themeId === activeTheme) return;
    setSavingTheme(true);
    const prev = profile;
    setProfile({ ...(profile ?? {}), portfolio_theme: themeId });
    const { error: saveError } = await upsertProfile(user.id, { portfolio_theme: themeId });
    if (saveError) {
      setProfile(prev);
      setError(saveError);
    }
    setSavingTheme(false);
  }

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchProfile();
        setProfile(data || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load portfolio profile');
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

  const shareableLink = username ? `${window.location.origin}/${username}` : '';

  async function copyShareableLink() {
    await navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: theme.bgBase }}>
        <h1 className="text-2xl font-bold mb-3" style={{ color: theme.heading }}>Portfolio Control Center</h1>
        <p className="text-sm font-mono mb-6 max-w-sm" style={{ color: theme.muted }}>
          Sign in to view your live portfolio link.
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
          className="px-6 py-3 rounded-lg text-sm font-bold transition-colors"
          style={{ background: theme.accentText, color: theme.bgBase }}
        >
          Initialize Session
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: theme.bgBase }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.accentText }} />
        <p className="text-sm font-mono" style={{ color: theme.muted }}>Loading portfolio link...</p>
      </div>
    );
  }

  if (error || !shareableLink) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4" style={{ background: theme.bgBase }}>
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-mono text-red-400 max-w-md">
          {error || 'Add a username in your profile to publish your portfolio.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ color: theme.heading }}>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.heading }}>Portfolio Control Center</h1>
        <p className="mb-8" style={{ color: theme.muted }}>Live-synced with your Global Profile, Resume, and Project Incubator data.</p>

        <div className="rounded-xl p-6 space-y-6 border" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
          <div>
            <h3 className="font-semibold mb-2" style={{ color: theme.accentText }}>Your Public Link</h3>
            <div className="flex flex-col gap-3 p-3 rounded-lg border sm:flex-row sm:items-center" style={{ background: theme.inputBg, borderColor: theme.cardBorder }}>
              <code className="flex-1 break-all text-sm" style={{ color: theme.body }}>{shareableLink}</code>
              <button
                onClick={copyShareableLink}
                className="inline-flex items-center justify-center gap-2 text-sm px-3 py-2 rounded transition-colors"
                style={{ background: theme.cardBg, color: theme.heading, border: `1px solid ${theme.cardBorder}` }}
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t" style={{ borderColor: theme.cardBorder }}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: theme.heading }}>Theme</h3>
            <p className="text-xs mb-4" style={{ color: theme.muted }}>How your public portfolio page looks. Applies immediately.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PORTFOLIO_THEMES.map((t) => {
                const selected = t.id === activeTheme;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTheme(t.id)}
                    disabled={savingTheme}
                    className="rounded-xl border p-4 text-left transition-colors disabled:opacity-60"
                    style={{
                      background: selected ? theme.accentSoftBg : theme.bgBase,
                      borderColor: selected ? theme.accentText : theme.cardBorder,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: theme.heading }}>{t.label}</span>
                      {selected && <span className="text-xs font-mono" style={{ color: theme.accentText }}>active</span>}
                    </div>
                    <p className="mt-1 text-xs" style={{ color: theme.muted }}>{t.blurb}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t" style={{ borderColor: theme.cardBorder }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: theme.heading }}>Data Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InViewFade delay={0}>
                <div className="border p-4 rounded-xl flex items-start gap-3" style={{ background: theme.bgBase, borderColor: theme.cardBorder }}>
                  <div className="p-2 rounded-lg shrink-0" style={{ background: theme.accentSoftBg }}>
                    <User className="h-5 w-5" style={{ color: theme.accentText }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: theme.heading }}>Global Profile</div>
                    <div className="text-xs font-mono mt-1 flex items-center gap-1" style={{ color: theme.accentText }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accentText }}></span>
                      Synced
                    </div>
                  </div>
                </div>
              </InViewFade>
              <InViewFade delay={0.1}>
                <div className="border p-4 rounded-xl flex items-start gap-3" style={{ background: theme.bgBase, borderColor: theme.cardBorder }}>
                  <div className="p-2 rounded-lg shrink-0" style={{ background: theme.accentSoftBg }}>
                    <Briefcase className="h-5 w-5" style={{ color: theme.accentText }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: theme.heading }}>Experience & Education</div>
                    <div className="text-xs font-mono mt-1 flex items-center gap-1" style={{ color: theme.accentText }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accentText }}></span>
                      Synced
                    </div>
                  </div>
                </div>
              </InViewFade>
              <InViewFade delay={0.2}>
                <div className="border p-4 rounded-xl flex items-start gap-3" style={{ background: theme.bgBase, borderColor: theme.cardBorder }}>
                  <div className="p-2 rounded-lg shrink-0" style={{ background: theme.accentSoftBg }}>
                    <Folder className="h-5 w-5" style={{ color: theme.accentText }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: theme.heading }}>Project Incubator</div>
                    <div className="text-xs font-mono mt-1 flex items-center gap-1" style={{ color: theme.accentText }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accentText }}></span>
                      Synced
                    </div>
                  </div>
                </div>
              </InViewFade>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end" style={{ borderColor: theme.cardBorder }}>
            <a
              href={shareableLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all"
              style={{ background: theme.accentText, color: theme.bgBase }}
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
