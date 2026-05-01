import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function PublicProfileView() {
  const { username } = useParams();
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://hailmary.onrender.com';
  const compiledPortfolioUrl = `${backendUrl}/api/portfolio/${username || ''}`;

  useEffect(() => {
    if (!username) return;
    // Keep the React landing page visible; switch to window.location.href here for instant redirects.
  }, [username, compiledPortfolioUrl]);

  return (
    <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-[#13161e] border border-[#252b3b] p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
          {username?.charAt(0).toUpperCase() || '?'}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          @{username || 'Developer'}'s Developer Profile
        </h1>
        <p className="text-slate-400 mb-8">
          This portfolio is powered by the HailMary Launch Platform.
        </p>

        <a
          href={compiledPortfolioUrl}
          className="flex w-full items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
        >
          Enter Portfolio
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
