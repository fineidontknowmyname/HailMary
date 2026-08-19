import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AppLayout } from './navigation/AppLayout';
import { useAuth } from './auth/useAuth';
import App from './App';
import ProfilePage from './pages/ProfilePage';
import UpdatePasswordModal from './components/UpdatePasswordModal';
import { AssessmentEngine } from './components/AssessmentEngine';

import TutorialsAndLabs from './pages/TutorialsAndLabs';
import ContributeResource from './components/ContributeResource';
import IncubatorPage from './pages/IncubatorPage';
import PortfolioPage from './pages/PortfolioPage';
import PublicProfileView from './pages/PublicProfileView';
import ResumeBuilder from './pages/ResumeBuilder';
import { pageVariants, pageTransition } from './lib/motion';
import { useAppTheme } from './lib/ThemeProvider';
import './AppRouter.css';

/** Wraps a page in the shared page-transition motion.div */
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
}
// ─── Placeholder pages for routes not yet built ────────────────────────────
// Replace each with the real page component once built.

function PlaceholderPage({ title }: { title: string }) {
  const { theme } = useAppTheme();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl border"
        style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
      >
        <span className="text-2xl">🚧</span>
      </div>
      <h1 className="text-2xl font-black" style={{ color: theme.heading }}>{title}</h1>
      <p className="font-mono text-sm" style={{ color: theme.muted }}>This module is coming soon.</p>
      <span
        className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-mono"
        style={{ borderColor: theme.accentBorder, background: theme.accentSoftBg, color: theme.accentText }}
      >
        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: theme.accentText }} />
        Under active development
      </span>
    </div>
  );
}

function DashboardLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

/**
 * AppRouter — defines all client-side routes and wraps each page
 * inside the global <AppLayout> (Sidebar + main area).
 *
 * The <UpdatePasswordModal> is rendered **outside** <Routes> so it
 * intercepts any landing route when Supabase fires PASSWORD_RECOVERY.
 */
export function AppRouter() {
  const { passwordRecoveryPending } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* ── Global password-recovery overlay ─────────────────────────── */}
      {passwordRecoveryPending && <UpdatePasswordModal />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          <Route element={<DashboardLayout />}>
            {/* ── Dashboard (existing App component) ─────────────── */}
            <Route path="/" element={<PageWrapper><App /></PageWrapper>} />

            {/* ── Profile ────────────────────────────────────────── */}
            <Route
              path="/profile"
              element={<PageWrapper><ProfilePage onBack={() => window.history.back()} /></PageWrapper>}
            />

            {/* ── Dedicated password-reset landing route ──────────── */}
            <Route
              path="/update-password"
              element={<UpdatePasswordModal />}
            />

            {/* ── Build section ──────────────────────────────────── */}
            <Route path="/incubator" element={<PageWrapper><IncubatorPage /></PageWrapper>} />
            <Route path="/dashboard/portfolio" element={<PageWrapper><PortfolioPage /></PageWrapper>} />
            <Route path="/portfolio" element={<PageWrapper><PortfolioPage /></PageWrapper>} />
            <Route path="/resume" element={<PageWrapper><ResumeBuilder /></PageWrapper>} />

            {/* ── Practice section ───────────────────────────────── */}
            <Route
              path="/mock-tests/*"
              element={
                <PageWrapper>
                  <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 md:-my-8">
                    <AssessmentEngine variant="mock" />
                  </div>
                </PageWrapper>
              }
            />
            <Route
              path="/aptitude"
              element={
                <PageWrapper>
                  <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 md:-my-8">
                    <AssessmentEngine variant="codevita" />
                  </div>
                </PageWrapper>
              }
            />

            {/* ── Learn section ──────────────────────────────────── */}
            <Route
              path="/tutorials/*"
              element={<PageWrapper><TutorialsAndLabs /></PageWrapper>}
            />
            <Route path="/contribute" element={<PageWrapper><ContributeResource /></PageWrapper>} />

          </Route>

          {/* ── Public Dynamic Route ────────────────────────────── */}
          <Route path="/:username" element={<PageWrapper><PublicProfileView /></PageWrapper>} />

          {/* ── Global 404 fallback ─────────────────────────────── */}
          <Route path="*" element={<PageWrapper><PlaceholderPage title="404 — Page Not Found" /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default AppRouter;
