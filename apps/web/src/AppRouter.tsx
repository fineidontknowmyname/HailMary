import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './navigation/AppLayout';
import { useAuth } from './auth/useAuth';
import App from './App';
import ProfilePage from './pages/ProfilePage';
import UpdatePasswordModal from './components/UpdatePasswordModal';
import { AssessmentEngine } from './components/AssessmentEngine';
import IdeaVault from './pages/IdeaVault';

// ─── Placeholder pages for routes not yet built ────────────────────────────
// Replace each with the real page component once built.

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(79,255,176,0.12) 0%, rgba(79,255,176,0.04) 100%)',
          border: '1px solid rgba(79,255,176,0.2)',
        }}
      >
        <span className="text-2xl">🚧</span>
      </div>
      <h1 className="text-2xl font-black text-white">{title}</h1>
      <p className="font-mono text-sm text-[#7a849a]">This module is coming soon.</p>
      <span className="inline-flex items-center gap-2 rounded-full border border-[#4fffb0]/20 bg-[#4fffb0]/5 px-4 py-1.5 text-xs font-mono text-[#4fffb0]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#4fffb0] animate-pulse" />
        Under active development
      </span>
    </div>
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

  return (
    <>
      {/* ── Global password-recovery overlay ─────────────────────────── */}
      {passwordRecoveryPending && <UpdatePasswordModal />}

      <AppLayout>
        <Routes>
          {/* ── Dashboard (existing App component) ─────────────── */}
          <Route path="/" element={<App />} />

          {/* ── Profile ────────────────────────────────────────── */}
          <Route
            path="/profile"
            element={<ProfilePage onBack={() => window.history.back()} />}
          />

          {/* ── Dedicated password-reset landing route ──────────── */}
          {/* Used when Supabase redirect URL is set to /update-password */}
          <Route
            path="/update-password"
            element={<UpdatePasswordModal />}
          />

          {/* ── Build section ──────────────────────────────────── */}
          <Route
            path="/idea-vault"
            element={
              <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 md:-my-8">
                <IdeaVault />
              </div>
            }
          />
          <Route
            path="/portfolio"
            element={<PlaceholderPage title="Portfolio Builder" />}
          />
          <Route
            path="/resume"
            element={<PlaceholderPage title="Resume Generator" />}
          />

          {/* ── Practice section ───────────────────────────────── */}
          <Route
            path="/mock-tests/*"
            element={
              /* Break out of AppLayout's padding so the quiz header + sidebar
                 can span the full viewport width and height. */
              <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 md:-my-8">
                <AssessmentEngine />
              </div>
            }
          />
          <Route
            path="/aptitude"
            element={<PlaceholderPage title="Competitive Aptitude" />}
          />

          {/* ── Learn section ──────────────────────────────────── */}
          <Route
            path="/tutorials/*"
            element={<PlaceholderPage title="Tutorials & Labs" />}
          />

          {/* ── 404 fallback ───────────────────────────────────── */}
          <Route
            path="*"
            element={<PlaceholderPage title="404 — Page Not Found" />}
          />
        </Routes>
      </AppLayout>
    </>
  );
}

export default AppRouter;
