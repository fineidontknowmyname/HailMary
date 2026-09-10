import { Suspense, lazy, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, UserX, AlertCircle } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { resolveThemeId } from '../components/portfolio-templates/types';
import type { PublicProfile, PublicProject } from '../components/portfolio-templates/types';

const EditorialTemplate = lazy(() => import('../components/portfolio-templates/EditorialTemplate'));
const MinimalTemplate = lazy(() => import('../components/portfolio-templates/MinimalTemplate'));
const TerminalTemplate = lazy(() => import('../components/portfolio-templates/TerminalTemplate'));

interface PortfolioResponse {
  profile: PublicProfile;
  projects: PublicProject[];
}

function StatusScreen({ title, message, tone }: { title: string; message: string; tone: 'loading' | 'error' | 'notfound' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4" style={{ background: '#4B3CE0', fontFamily: 'Manrope, sans-serif' }}>
      {tone === 'loading' && <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#D4F547' }} />}
      {tone === 'error' && <AlertCircle className="h-10 w-10" style={{ color: '#D4F547' }} />}
      {tone === 'notfound' && <UserX className="h-10 w-10" style={{ color: '#D4F547' }} />}
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h1>
      <p className="text-sm max-w-sm" style={{ color: '#C9C4F0' }}>{message}</p>
      <Link to="/" className="text-sm font-semibold hover:underline" style={{ color: '#D4F547' }}>
        ← Back to HailMary
      </Link>
    </div>
  );
}

export default function PublicProfileView() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    async function loadPortfolio() {
      setLoading(true);
      setNotFound(false);
      setLoadError(null);
      try {
        const result = await api.get<PortfolioResponse>(`/api/portfolio/${username}`);
        if (!cancelled) setData(result);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(err instanceof Error ? err.message : 'Failed to load portfolio');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPortfolio();
    return () => { cancelled = true; };
  }, [username]);

  if (loading) return <StatusScreen tone="loading" title="Loading portfolio…" message="" />;
  if (loadError) return <StatusScreen tone="error" title="Couldn't load this portfolio" message={loadError} />;
  if (notFound || !data) {
    return (
      <StatusScreen
        tone="notfound"
        title={`No portfolio at @${username}`}
        message="This operative hasn't claimed this handle, or hasn't published a portfolio yet."
      />
    );
  }

  const themeId = resolveThemeId(data.profile.portfolio_theme);
  const Template = themeId === 'minimal' ? MinimalTemplate : themeId === 'terminal' ? TerminalTemplate : EditorialTemplate;

  return (
    <Suspense fallback={<StatusScreen tone="loading" title="Loading portfolio…" message="" />}>
      <Template profile={data.profile} projects={data.projects} />
    </Suspense>
  );
}
