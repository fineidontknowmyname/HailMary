import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FilterBar } from './components/FilterBar';
import { IntelCard } from './components/IntelCard';
import { SkeletonCard } from './components/SkeletonCard';
import { SignInModal } from './components/SignInModal';
import { DoubtSolverModal } from './components/DoubtSolverModal';
import { ChallengeModal } from './components/ChallengeModal';
import ProfilePage from './pages/ProfilePage';
import SessionManager from './components/SessionManager';
import { AnimatedNumber } from './components/ui/AnimatedNumber';
import { TextReveal } from './components/ui/TextReveal';

import { useBoundStore } from './store/useBoundStore';
import { useProgress } from './hooks/useProgress';
import { useAuth } from './auth/useAuth';

import { useAuthStore } from './auth/authStore';
import type { Intel } from '@hailmary/types';
import { staggerContainer, staggerItem, fadeUp } from './lib/motion';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<string | null>(null);
  const [intelForDoubt, setIntelForDoubt] = useState<Intel | null>(null);
  const [intelForChallenge, setIntelForChallenge] = useState<Intel | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeResource, setActiveResource] = useState<Intel | null>(null);

  const initialize = useAuthStore(s => s.initialize);
  const initialized = useAuthStore(s => s.initialized);
  const { user } = useAuth();
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
        (item.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

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
    <div className="h-full bg-[#0b0e14] text-white selection:bg-[#4fffb0] selection:text-black">

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />


      <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-[#111520] border border-[#1e2535] rounded-full px-4 py-2 text-xs font-mono text-[#4fffb0] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4fffb0] animate-pulse" />
          {isLoggedIn
            ? `Welcome back, ${user?.email?.split('@')[0]}`
            : '100% free · no sign-up required to browse'}
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
          Every free dev resource.<br/>
          <span className="text-[#4fffb0]">
            <TextReveal text="One place." delay={0.3} />
          </span>
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
        <motion.div
          className="flex gap-4 justify-center flex-wrap mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Numeric stats use AnimatedNumber for count-up; text stats render plain */}
          <motion.div
            className="bg-[#111520] border border-[#1e2535] rounded-xl px-5 py-3 text-center"
            variants={staggerItem}
          >
            <div className="text-xl font-black text-[#4fffb0]">
              <AnimatedNumber value={intel.length} suffix="+" />
            </div>
            <div className="text-xs font-mono text-[#7a849a] uppercase tracking-wider">Intel Pieces</div>
          </motion.div>

          <motion.div
            className="bg-[#111520] border border-[#1e2535] rounded-xl px-5 py-3 text-center"
            variants={staggerItem}
          >
            <div className="text-xl font-black text-[#4fffb0]">100%</div>
            <div className="text-xs font-mono text-[#7a849a] uppercase tracking-wider">Free</div>
          </motion.div>

          <motion.div
            className="bg-[#111520] border border-[#1e2535] rounded-xl px-5 py-3 text-center"
            variants={staggerItem}
          >
            <div className="text-xl font-black text-[#4fffb0]">ZPD</div>
            <div className="text-xs font-mono text-[#7a849a] uppercase tracking-wider">Optimized</div>
          </motion.div>

          {isLoggedIn && (
            <motion.div
              className="bg-[#111520] border border-[#1e2535] rounded-xl px-5 py-3 text-center"
              variants={staggerItem}
            >
              <div className="text-xl font-black text-[#4fffb0]">
                <AnimatedNumber value={completed.size} />
              </div>
              <div className="text-xs font-mono text-[#7a849a] uppercase tracking-wider">Missions Done</div>
            </motion.div>
          )}
        </motion.div>

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
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              className="text-center py-24 text-red-400 font-mono text-sm border border-red-900/50 rounded-xl bg-red-900/10"
              variants={fadeUp} initial="initial" animate="animate"
            >
              <div className="text-4xl mb-4">⚠️</div>
              Could not connect to API. Is the server running?<br />
              <span className="text-xs text-red-500/70 mt-2 block">{error}</span>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i} variants={staggerItem}>
                  <SkeletonCard />
                </motion.div>
              ))}
            </motion.div>
          ) : filteredIntel.length === 0 ? (
            <motion.div
              key="empty"
              className="text-center py-24 text-[#7a849a] font-mono text-sm border border-[#1e2535] rounded-xl bg-[#111520]"
              variants={fadeUp} initial="initial" animate="animate"
            >
              <div className="text-4xl mb-4">🔍</div>
              No intel matches your current parameters.
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredIntel.map((item: Intel) => (
                <motion.div key={item.id} variants={staggerItem}>
                  <IntelCard
                    intel={item}
                    onStartSession={() => setActiveResource(item)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="border-t border-[#1e2535] py-8 text-center text-xs font-mono text-[#7a849a]">
        Project Hail Mary · All intel is free ·{' '}
        <span className="text-[#4fffb0]">Built for serious developers</span>
      </footer>

      <AnimatePresence>
        {intelForDoubt && (
          <DoubtSolverModal
            intel={intelForDoubt}
            onClose={() => setIntelForDoubt(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {intelForChallenge && (
          <ChallengeModal
            intel={intelForChallenge}
            onClose={() => setIntelForChallenge(null)}
            onSuccess={() => toggleComplete(intelForChallenge.id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeResource && (
          <SessionManager 
            resource={activeResource} 
            user={user}
            onClose={() => setActiveResource(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}