import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../auth/useAuth';
import { MFAChallenge } from '../components/MFAChallenge';
import { SignInModal } from '../components/SignInModal';
import { supabase } from '../lib/supabase';
import { FONT_HEADING, NOISE_BG, DOT_GRID_BG, accentHoverShadow } from '../lib/theme';
import { useAppTheme } from '../lib/ThemeProvider';

interface AppLayoutProps {
  /** The page content rendered to the right of the sidebar. */
  children: React.ReactNode;
}

/**
 * AppLayout — The master App Shell.
 *
 * Renders a persistent <Sidebar> on the left (desktop) and a flexible,
 * scrollable <main> on the right.  On mobile the sidebar becomes a
 * hamburger-driven off-canvas drawer, so the main area occupies the full
 * viewport width.
 *
 * Desktop layout:
 *   [240px sidebar | flex-1 main]
 *
 * Mobile layout:
 *   [full-width main]  ← sidebar slides in from left on demand
 *   [bottom tab bar]   ← always visible at the bottom
 *
 * Usage:
 *   <AppLayout>
 *     <YourPageComponent />
 *   </AppLayout>
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { session } = useAuth();
  const { theme, mode, toggleMode } = useAppTheme();
  const [needsMFA, setNeedsMFA] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Listen for the global 'open-auth-modal' custom event dispatched by
  // child pages (ProfilePage, IncubatorPage, PortfolioPage, ResumeBuilder)
  const openModal = useCallback(() => setShowSignIn(true), []);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  useEffect(() => {
    window.addEventListener('open-auth-modal', openModal);
    window.addEventListener('toggle-sidebar', toggleSidebar);
    return () => {
      window.removeEventListener('open-auth-modal', openModal);
      window.removeEventListener('toggle-sidebar', toggleSidebar);
    };
  }, [openModal, toggleSidebar]);

  useEffect(() => {
    let isMounted = true;

    async function checkAAL() {
      if (session?.user) {
        // Fallback check on session object directly if AAL exists
        const sessionAal = (session as any).aal;
        const hasFactors = session.user.factors && session.user.factors.length > 0;

        if (sessionAal && hasFactors && sessionAal === 'aal1') {
          if (isMounted) setNeedsMFA(true);
          return;
        }

        // Fetch AAL reliably via Supabase SDK
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (!error && data) {
          if (hasFactors && data.currentLevel === 'aal1') {
            if (isMounted) setNeedsMFA(true);
          } else {
            if (isMounted) setNeedsMFA(false);
          }
        }
      } else {
        if (isMounted) setNeedsMFA(false);
      }
    }

    checkAAL();

    // Listen to auth state changes to dynamically dismiss or show MFA Challenge
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAAL();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [session]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden transition-colors duration-300" style={{ background: theme.bgBase, color: theme.heading }}>
      {mode === 'dark' && (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div
            className="absolute -top-1/4 -left-1/4 h-[70vh] w-[70vh]"
            style={{
              background: `radial-gradient(circle, rgba(34,211,238,0.14) 0%, rgba(34,211,238,0.04) 40%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute -top-1/4 -left-1/4 h-[70vh] w-[70vh]"
            style={{
              backgroundImage: DOT_GRID_BG,
              backgroundSize: '28px 28px',
              maskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
              WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
              opacity: 0.3,
            }}
          />
          <div className="absolute inset-0" style={{ backgroundImage: NOISE_BG }} />
        </div>
      )}

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />

      {needsMFA && (
        <MFAChallenge onSuccess={() => setNeedsMFA(false)} />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="h-16 px-6 border-b flex items-center justify-between shrink-0 backdrop-blur-xl transition-colors duration-300"
          style={{ borderColor: theme.cardBorder, background: theme.headerBg }}
        >
          <div className="flex items-center gap-4">
            <button
              className="cursor-pointer p-2 -ml-2 transition-colors"
              style={{ color: theme.accentText }}
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="font-bold text-xl tracking-tight" style={{ fontFamily: FONT_HEADING, color: theme.heading }}>
              Hail<span style={{ color: theme.accentText }}>Mary</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono hidden sm:block" style={{ color: theme.muted }}>
              49 of 49 intel
            </span>

            <motion.button
              onClick={toggleMode}
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
              style={{ borderColor: theme.cardBorder, color: theme.accentText, background: theme.cardBg }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>

            {session?.user ? (
              <motion.button
                onClick={() => window.dispatchEvent(new CustomEvent('open-profile'))}
                className="text-xs font-bold px-4 py-2 rounded-full transition-colors"
                style={{ background: theme.accentText, color: theme.bgBase }}
                whileHover={{ boxShadow: accentHoverShadow(theme) }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                Mission Control
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setShowSignIn(true)}
                className="text-xs font-bold px-4 py-2 rounded-full transition-colors"
                style={{ background: theme.accentText, color: theme.bgBase }}
                whileHover={{ boxShadow: accentHoverShadow(theme) }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                Sign In
              </motion.button>
            )}
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {needsMFA ? (
              <div className="flex h-full min-h-[50vh] flex-col items-center justify-center opacity-50">
                <p className="text-sm font-mono" style={{ color: theme.muted }}>
                  Awaiting Two-Factor Authentication...
                </p>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
