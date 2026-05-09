import React from 'react';
import { Menu, Rocket } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = '#4fffb0';

interface TopNavProps {
  /** Called when the hamburger button is pressed. */
  onToggleSidebar: () => void;
}

/**
 * TopNav — Global top navigation bar rendered inside AppLayout.
 *
 * Contains:
 *   - Hamburger button (visible only on mobile / < md breakpoint)
 *   - Logo / branding
 *   - Right-side auth / user section
 */
export const TopNav: React.FC<TopNavProps> = ({ onToggleSidebar }) => {
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#1e2535] bg-[#0d1117]/80 backdrop-blur-md px-4 sm:px-6 py-3">
      {/* ── Left: Hamburger + Logo ─────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Hamburger — visible only below md */}
        <button
          id="hamburger-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="inline-flex md:hidden items-center justify-center p-2 -ml-2 rounded-lg text-[#7a849a] hover:text-white hover:bg-white/5 active:scale-95 transition-all duration-150"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Branding — only shown on mobile (desktop has sidebar logo) */}
        <div className="flex items-center gap-2 md:hidden">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(79,255,176,0.2) 0%, rgba(79,255,176,0.05) 100%)',
              border: '1px solid rgba(79,255,176,0.25)',
            }}
          >
            <Rocket className="h-3.5 w-3.5" style={{ color: ACCENT }} strokeWidth={2} />
          </span>
          <span className="text-sm font-black tracking-tight text-white">
            Hail<span style={{ color: ACCENT }}>Mary</span>
          </span>
        </div>
      </div>

      {/* ── Right: Auth Actions ────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <span className="hidden sm:block text-[10px] font-mono text-[#3d4760] uppercase tracking-wider">
              {user?.email?.split('@')[0]}
            </span>
            <button
              onClick={signOut}
              className="text-xs font-mono text-[#7a849a] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
            className="text-xs font-mono font-bold px-4 py-2 rounded-xl transition-all duration-150
              bg-[#4fffb0] text-[#0b0e14] hover:bg-[#3de89e] active:scale-95"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default TopNav;
