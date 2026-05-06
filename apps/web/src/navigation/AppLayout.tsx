import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
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

  useEffect(() => {
    window.addEventListener('open-auth-modal', openModal);
    return () => window.removeEventListener('open-auth-modal', openModal);
  }, [openModal]);

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
    <div className="flex min-h-screen bg-[#0b0e14] text-white relative">
      {/* ── Global Sign-In Modal ──────────────────────────────────── */}
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />

      {/* ── MFA Overlay ─────────────────────────────────────────────── */}
      {needsMFA && (
        <MFAChallenge onSuccess={() => setNeedsMFA(false)} />
      )}

      {/* Dark Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Hamburger Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-[#0b0e14] border border-[#1e222d] rounded-md text-[#7a849a] hover:text-white transition-colors md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {/* ── Main content area ───────────────────────────────────────── */}
      <main
        id="main-content"
        tabIndex={-1}
        className={[
          'flex-1 min-w-0',
          'md:pl-[240px]',   // offset for fixed desktop sidebar
          'pb-16 md:pb-0',   // offset for mobile bottom tab bar
          'overflow-y-auto',
          'min-h-screen',
        ].join(' ')}
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
  );
};

export default AppLayout;
