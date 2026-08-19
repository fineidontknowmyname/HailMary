import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FilterBar } from './components/FilterBar';
import { IntelCard } from './components/IntelCard';
import { SkeletonCard } from './components/SkeletonCard';
import { SignInModal } from './components/SignInModal';
import { DoubtSolverModal } from './components/DoubtSolverModal';
import { ChallengeModal } from './components/ChallengeModal';
import SessionManager from './components/SessionManager';
import { AnimatedNumber } from './components/ui/AnimatedNumber';
import { TextReveal } from './components/ui/TextReveal';

import { useBoundStore } from './store/useBoundStore';
import { useProgress } from './hooks/useProgress';
import { useAuth } from './auth/useAuth';

import { useAuthStore } from './auth/authStore';
import type { Intel } from '@hailmary/types';
import { staggerContainer, staggerItem, fadeUp } from './lib/motion';
import { FONT_HEADING, FONT_DISPLAY, GLASS_CARD_CLASS, glassCardStyle, accentHoverShadow } from './lib/theme';
import { useAppTheme } from './lib/ThemeProvider';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));

export default function App() {
  const { theme } = useAppTheme();
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bgBase }}>
        <div className="font-bold text-2xl animate-pulse" style={{ fontFamily: FONT_HEADING, color: theme.heading }}>
          Hail<span style={{ color: theme.accentText }}>Mary</span>
        </div>
      </div>
    );
  }

  if (showProfile && isLoggedIn) {
    return (
      <Suspense fallback={null}>
        <ProfilePage onBack={() => setShowProfile(false)} />
      </Suspense>
    );
  }

  return (
    <div className="h-full" style={{ color: theme.heading }}>

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />

      <div className={`max-w-3xl mx-auto px-6 sm:px-10 py-10 sm:py-12 text-center ${GLASS_CARD_CLASS}`} style={glassCardStyle(theme)}>
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono mb-8"
          style={{ background: theme.accentSoftBg, border: `1px solid ${theme.cardBorder}`, color: theme.accentText }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.accentText }} />
          {isLoggedIn
            ? `Welcome back, ${user?.email?.split('@')[0]}`
            : '100% free · no sign-up required to browse'}
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4" style={{ fontFamily: FONT_DISPLAY }}>
          Every free dev resource.<br/>
          <span style={{ color: theme.accentText }}>
            <TextReveal text="One place." delay={0.3} />
          </span>
        </h1>

        <p className="text-lg leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: theme.body }}>
          Courses, docs, YouTube tutorials, coding problems, and open source —
          curated for developers who want to learn deeply.
        </p>

        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by topic, language, or concept…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-full px-6 py-4 text-sm outline-none transition-all font-mono"
            style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = accentHoverShadow(theme); e.currentTarget.style.borderColor = theme.accentBorderStrong; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = theme.inputBorder; }}
          />
          <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.muted }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path strokeLinecap="round" d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <motion.div
          className="flex gap-4 justify-center flex-wrap mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className={`px-5 py-3 text-center ${GLASS_CARD_CLASS}`}
            style={glassCardStyle(theme)}
            variants={staggerItem}
          >
            <div className="text-xl font-bold" style={{ color: theme.accentText, fontFamily: FONT_HEADING }}>
              <AnimatedNumber value={intel.length} suffix="+" />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider" style={{ color: theme.muted }}>Intel Pieces</div>
          </motion.div>

          <motion.div
            className={`px-5 py-3 text-center ${GLASS_CARD_CLASS}`}
            style={glassCardStyle(theme)}
            variants={staggerItem}
          >
            <div className="text-xl font-bold" style={{ color: theme.accentText, fontFamily: FONT_HEADING }}>100%</div>
            <div className="text-xs font-mono uppercase tracking-wider" style={{ color: theme.muted }}>Free</div>
          </motion.div>

          <motion.div
            className={`px-5 py-3 text-center ${GLASS_CARD_CLASS}`}
            style={glassCardStyle(theme)}
            variants={staggerItem}
          >
            <div className="text-xl font-bold" style={{ color: theme.accentText, fontFamily: FONT_HEADING }}>ZPD</div>
            <div className="text-xs font-mono uppercase tracking-wider" style={{ color: theme.muted }}>Optimized</div>
          </motion.div>

          {isLoggedIn && (
            <motion.div
              className={`px-5 py-3 text-center ${GLASS_CARD_CLASS}`}
              style={glassCardStyle(theme)}
              variants={staggerItem}
            >
              <div className="text-xl font-bold" style={{ color: theme.accentText, fontFamily: FONT_HEADING }}>
                <AnimatedNumber value={completed.size} />
              </div>
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color: theme.muted }}>Missions Done</div>
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
              className={`text-center py-24 font-mono text-sm ${GLASS_CARD_CLASS}`}
              style={{ ...glassCardStyle(theme), color: theme.muted }}
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

      <footer className="border-t py-8 text-center text-xs font-mono" style={{ borderColor: theme.cardBorder, color: theme.muted }}>
        Project Hail Mary · All intel is free ·{' '}
        <span style={{ color: theme.accentText }}>Built for serious developers</span>
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
