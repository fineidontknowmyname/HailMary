import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Trophy, Lock } from 'lucide-react';
import { FilterBar } from './components/FilterBar';
import { IntelCard } from './components/IntelCard';
import { ExternalResourceCard } from './components/ExternalResourceCard';
import { SkeletonCard } from './components/SkeletonCard';
import AuthModal from './components/AuthModal';
import { DoubtSolverModal } from './components/DoubtSolverModal';
import { ChallengeModal } from './components/ChallengeModal';
import ProfilePage from './pages/ProfilePage';

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

  const initialize = useAuthStore(s => s.initialize);
  const initialized = useAuthStore(s => s.initialized);
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;

  const { intel, isLoading, error, fetchIntel } = useBoundStore();
  const { completed, toggleComplete, isComplete } = useProgress();

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

  const completedResources = useMemo(
    () => filteredIntel.filter((item: Intel) => completed.has(item.id)),
    [filteredIntel, completed]
  );

  const upNextResource = useMemo(
    () => filteredIntel.find((item: Intel) => !completed.has(item.id)) ?? null,
    [filteredIntel, completed]
  );

  const lockedResources = useMemo(() => {
    if (!upNextResource) return [];
    const upNextIdx = filteredIntel.findIndex((item: Intel) => item.id === upNextResource.id);
    return filteredIntel.slice(upNextIdx + 1);
  }, [filteredIntel, upNextResource]);

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

        ) : isLoggedIn ? (
          <div className="flex flex-col gap-12">

            {upNextResource ? (
              <section aria-labelledby="up-next-heading">
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#4fffb0] animate-pulse" />
                  <h2
                    id="up-next-heading"
                    className="text-xs font-mono font-semibold uppercase tracking-widest text-[#4fffb0]"
                  >
                    Up Next
                  </h2>
                  <span className="text-xs font-mono text-[#7a849a]">
                    — your current active challenge
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-[#4fffb0]/40 via-[#7c6aff]/30 to-[#4fffb0]/40 blur-sm" />
                  <div className="relative rounded-xl ring-1 ring-[#4fffb0]/30 shadow-xl shadow-[#4fffb0]/5">
                    <ExternalResourceCard intel={upNextResource} />
                  </div>
                </div>
              </section>
            ) : (
              <section
                aria-label="Course completed"
                className="flex flex-col items-center justify-center py-20 text-center gap-4"
              >
                <div className="relative">
                  <Trophy className="w-20 h-20 text-[#ffc93c]" />
                  <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  Mission Complete
                </h2>
                <p className="text-[#7a849a] max-w-sm font-mono text-sm leading-relaxed">
                  You've conquered every piece of intel in this queue.
                  Clear your filters or check back for new resources.
                </p>
                <div className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-[#4fffb0]/10 border border-[#4fffb0]/30 rounded-full text-[#4fffb0] text-sm font-mono font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  {completedResources.length} of {filteredIntel.length} completed
                </div>
              </section>
            )}

            {completedResources.length > 0 && (
              <section aria-labelledby="completed-heading">
                <div className="flex items-center gap-3 mb-5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h2
                    id="completed-heading"
                    className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400"
                  >
                    Completed Journey
                  </h2>
                  <span className="ml-auto text-xs font-mono text-[#7a849a]">
                    {completedResources.length} mission{completedResources.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedResources.map((item: Intel) => (
                    <div key={item.id} className="relative opacity-70 hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </div>
                      <IntelCard
                        intel={item}
                        isLoggedIn={isLoggedIn}
                        isComplete={true}
                        onToggle={() => toggleComplete(item.id)}
                        onAskDoubt={() => setIntelForDoubt(item)}
                        onChallenge={() => setIntelForChallenge(item)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {lockedResources.length > 0 && (
              <section aria-labelledby="locked-heading">
                <div className="flex items-center gap-3 mb-5">
                  <Lock className="w-4 h-4 text-[#7a849a]" />
                  <h2
                    id="locked-heading"
                    className="text-xs font-mono font-semibold uppercase tracking-widest text-[#7a849a]"
                  >
                    Coming Up
                  </h2>
                  <span className="ml-auto text-xs font-mono text-[#7a849a]">
                    {lockedResources.length} remaining
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lockedResources.map((item: Intel) => (
                    <div
                      key={item.id}
                      className="relative opacity-40 pointer-events-none select-none"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#0b0e14]/60 backdrop-blur-[1px]">
                        <Lock className="w-6 h-6 text-[#7a849a]" />
                      </div>
                      <IntelCard
                        intel={item}
                        isLoggedIn={false}
                        isComplete={false}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIntel.map((item: Intel) => (
              <IntelCard
                key={item.id}
                intel={item}
                isLoggedIn={isLoggedIn}
                isComplete={isComplete(item.id)}
                onToggle={() => toggleComplete(item.id)}
                onAskDoubt={() => setIntelForDoubt(item)}
                onChallenge={() => setIntelForChallenge(item)}
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
    </div>
  );
}