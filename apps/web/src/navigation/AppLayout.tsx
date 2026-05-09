import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../auth/useAuth';
import { MFAChallenge } from '../components/MFAChallenge';
import { SignInModal } from '../components/SignInModal';
import { supabase } from '../lib/supabase';

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
    <div className="flex h-screen w-full bg-[#0d1117] text-white overflow-hidden">
      {/* ── Global Sign-In Modal ──────────────────────────────────── */}
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />

      {/* ── MFA Overlay ─────────────────────────────────────────────── */}
      {needsMFA && (
        <MFAChallenge onSuccess={() => setNeedsMFA(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* ── Mobile overlay — fades in/out with CSS transition ──────── */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]
          transition-opacity duration-300 ease-in-out
          ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      {/* ── Main content area (Right Column) ────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Shell Header */}
        <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <button
              className="cursor-pointer p-2 -ml-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="font-black text-xl tracking-tight uppercase text-white">
              Project <span className="text-[#4fffb0]">Hail Mary</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[#7a849a] hidden sm:block">
              49 of 49 intel
            </span>
            {session?.user ? (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-profile'))}
                className="text-xs font-mono px-4 py-2 bg-[#1e2535] border border-[#2a3145] text-white rounded-xl hover:border-[#4fffb0]/50 transition-all"
              >
                Mission Control
              </button>
            ) : (
              <button
                onClick={() => setShowSignIn(true)}
                className="text-xs font-mono px-4 py-2 bg-[#4fffb0] text-[#0b0e14] font-bold rounded-xl hover:bg-[#3de89e] transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto"
        >
          {/* Inner wrapper — constrains max width and adds consistent padding */}
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {/* Block main children if MFA is required */}
            {needsMFA ? (
              <div className="flex h-full min-h-[50vh] flex-col items-center justify-center opacity-50">
                <p className="text-sm font-mono text-[#7a849a]">
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
