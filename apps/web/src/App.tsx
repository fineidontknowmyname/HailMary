import { useState, useEffect, useMemo } from 'react';
import { FilterBar } from './components/FilterBar';
import { IntelCard } from './components/IntelCard';
import { SkeletonCard } from './components/SkeletonCard';
import AuthModal from './components/AuthModal';
import { DoubtSolverModal } from './components/DoubtSolverModal';
import { ChallengeModal } from './components/ChallengeModal';
import ProfilePage from './pages/ProfilePage';
import SessionManager from './components/SessionManager';

import { useBoundStore } from './store/useBoundStore';
import { useProgress } from './hooks/useProgress';
import { useAuth } from './auth/useAuth';

import { useAuthStore } from './auth/authStore';
import type { Intel } from '@hailmary/types';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<string | null>(null);
  const [intelForDoubt, setIntelForDoubt] = useState<Intel | null>(null);
  const [intelForChallenge, setIntelForChallenge] = useState<Intel | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeResource, setActiveResource] = useState<Intel | null>(null);

  const initialize = useAuthStore(s => s.initialize);
  const initialized = useAuthStore(s => s.initialized);
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;

  const { intel, isLoading, error, fetchIntel } = useBoundStore();
  const { completed, toggleComplete } = useProgress();

  useEffect(() => {
    initialize();
    fetchIntel();
  }, [initialize, fetchIntel]);

  const filteredIntel = useMemo(() => {
    return intel.filter((item: Intel) => {
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = !selectedType || item.type === selectedType;
      const matchesDepth = !selectedDepth || item.depth === selectedDepth;

      return matchesSearch && matchesType && matchesDepth;
    });
  }, [intel, searchQuery, selectedType, selectedDepth]);



  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="font-black text-2xl animate-pulse text-white">
          Project <span className="text-[#4fffb0]">Hail Mary</span>
        </div>
      </div>
    );
  }

  if (showProfile && isLoggedIn) {
    return <ProfilePage onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white selection:bg-[#4fffb0] selection:text-black">

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <nav className="sticky top-0 z-40 bg-[#0b0e14]/80 backdrop-blur-md border-b border-[#1e2535]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-black text-xl tracking-tight uppercase">
            Project <span className="text-[#4fffb0]">Hail Mary</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#7a849a] hidden sm:block">
              {filteredIntel.length} of {intel.length} intel
            </span>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {completed.size > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-emerald-400">{completed.size} done</span>
                  </div>
                )}
                <button
                  onClick={() => setShowProfile(true)}
                  className="text-xs font-mono px-4 py-2 bg-[#1e2535] border border-[#2a3145] text-white rounded-xl hover:border-[#4fffb0]/50 transition-all"
                >
                  Mission Control
                </button>
                <button
                  onClick={signOut}
                  className="text-xs font-mono text-[#7a849a] hover:text-white transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-xs font-mono px-4 py-2 bg-[#4fffb0] text-[#0b0e14] font-bold rounded-xl hover:bg-[#3de89e] transition-colors"
              >
                Initialize
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-[#111520] border border-[#1e2535] rounded-full px-4 py-2 text-xs font-mono text-[#4fffb0] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4fffb0] animate-pulse" />
          {isLoggedIn
            ? `Welcome back, ${user?.email?.split('@')[0]}`
            : '100% free · no sign-up required to browse'}
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
          Every free dev resource.<br/>
          <span className="text-[#4fffb0]">One place.</span>
        </h1>

        <p className="text-[#7a849a] text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          Courses, docs, YouTube tutorials, coding problems, and open source —
          curated for developers who want to learn deeply.
        </p>

        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by topic, language, or concept…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#111520] border border-[#1e2535] rounded-full px-6 py-4 text-sm text-white placeholder-[#7a849a] outline-none focus:border-[#4fffb0] focus:ring-2 focus:ring-[#4fffb0]/10 transition-all font-mono"
          />
          <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a849a]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path strokeLinecap="round" d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="flex gap-4 justify-center flex-wrap mb-8">
          {[
            { n: `${intel.length}+`, l: 'Intel Pieces' },
            { n: '100%', l: 'Free' },
            { n: 'ZPD', l: 'Optimized' },
            ...(isLoggedIn ? [{ n: String(completed.size), l: 'Missions Done' }] : []),
          ].map(s => (
            <div key={s.l} className="bg-[#111520] border border-[#1e2535] rounded-xl px-5 py-3 text-center">
              <div className="text-xl font-black text-[#4fffb0]">{s.n}</div>
              <div className="text-xs font-mono text-[#7a849a] uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>

        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedDepth={selectedDepth}
          setSelectedDepth={setSelectedDepth}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {error ? (
          <div className="text-center py-24 text-red-400 font-mono text-sm border border-red-900/50 rounded-xl bg-red-900/10">
            <div className="text-4xl mb-4">⚠️</div>
            Could not connect to API. Is the server running at localhost:4000?<br />
            <span className="text-xs text-red-500/70 mt-2 block">{error}</span>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredIntel.length === 0 ? (
          <div className="text-center py-24 text-[#7a849a] font-mono text-sm border border-[#1e2535] rounded-xl bg-[#111520]">
            <div className="text-4xl mb-4">🔍</div>
            No intel matches your current parameters.
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIntel.map((item: Intel) => (
              <IntelCard
                key={item.id}
                intel={item}
                onStartSession={() => setActiveResource(item)}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-[#1e2535] py-8 text-center text-xs font-mono text-[#7a849a]">
        Project Hail Mary · All intel is free ·{' '}
        <span className="text-[#4fffb0]">Built for serious developers</span>
      </footer>

      {intelForDoubt && (
        <DoubtSolverModal
          intel={intelForDoubt}
          onClose={() => setIntelForDoubt(null)}
        />
      )}

      {intelForChallenge && (
        <ChallengeModal
          intel={intelForChallenge}
          onClose={() => setIntelForChallenge(null)}
          onSuccess={() => toggleComplete(intelForChallenge.id)}
        />
      )}

      {activeResource && (
        <SessionManager 
          resource={activeResource} 
          user={user}
          onClose={() => setActiveResource(null)} 
        />
      )}
    </div>
  );
}