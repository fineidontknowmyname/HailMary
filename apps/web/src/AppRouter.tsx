import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AppLayout } from './navigation/AppLayout';
import { useAuth } from './auth/useAuth';
import App from './App';
import UpdatePasswordModal from './components/UpdatePasswordModal';
import { pageVariants, pageTransition } from './lib/motion';
import { useAppTheme } from './lib/ThemeProvider';
import './AppRouter.css';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MissionLog = lazy(() => import('./pages/MissionLog'));
const PathPage = lazy(() => import('./pages/PathPage'));
const AssessmentEngine = lazy(() => import('./components/AssessmentEngine').then(m => ({ default: m.AssessmentEngine })));
const TutorialsAndLabs = lazy(() => import('./pages/TutorialsAndLabs'));
const ContributeResource = lazy(() => import('./components/ContributeResource'));
const IncubatorPage = lazy(() => import('./pages/IncubatorPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const PublicProfileView = lazy(() => import('./pages/PublicProfileView'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));

function RouteFallback() {
  const { theme } = useAppTheme();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: theme.accentText, borderRightColor: theme.accentText }} />
    </div>
  );
}

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

function RequireAuth({ children, title }: { children: React.ReactNode; title: string }) {
  const { isLoggedIn } = useAuth();
  const { theme } = useAppTheme();

  useEffect(() => {
    if (!isLoggedIn) window.dispatchEvent(new Event('open-auth-modal'));
  }, [isLoggedIn]);

  if (isLoggedIn) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl border"
        style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
      >
        <span className="text-2xl">🔒</span>
      </div>
      <h1 className="text-2xl font-black" style={{ color: theme.heading }}>{title}</h1>
      <p className="font-mono text-sm" style={{ color: theme.muted }}>
        Sign in or sign up to access this module.
      </p>
      <button
        onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-mono"
        style={{ borderColor: theme.accentBorder, background: theme.accentSoftBg, color: theme.accentText }}
      >
        Sign in / Sign up →
      </button>
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
        <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>

          <Route element={<DashboardLayout />}>
            {/* ── Dashboard (existing App component) ─────────────── */}
            <Route path="/" element={<PageWrapper><App /></PageWrapper>} />

            {/* ── Profile ────────────────────────────────────────── */}
            <Route
              path="/profile"
              element={<PageWrapper><ProfilePage onBack={() => window.history.back()} /></PageWrapper>}
            />

            <Route
              path="/missions"
              element={
                <PageWrapper>
                  <RequireAuth title="Mission Log">
                    <MissionLog />
                  </RequireAuth>
                </PageWrapper>
              }
            />

            <Route
              path="/path"
              element={
                <PageWrapper>
                  <RequireAuth title="Learning Path">
                    <PathPage />
                  </RequireAuth>
                </PageWrapper>
              }
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
                  <RequireAuth title="Mock Tests">
                    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 md:-my-8">
                      <AssessmentEngine variant="mock" />
                    </div>
                  </RequireAuth>
                </PageWrapper>
              }
            />
            <Route
              path="/aptitude"
              element={
                <PageWrapper>
                  <RequireAuth title="Competitive Aptitude">
                    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 md:-my-8">
                      <AssessmentEngine variant="codevita" />
                    </div>
                  </RequireAuth>
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
        </Suspense>
      </AnimatePresence>
    </>
  );
}

export default AppRouter;
