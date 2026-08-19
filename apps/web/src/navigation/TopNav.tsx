import React from 'react';
import { Menu, Rocket } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { FONT_HEADING } from '../lib/theme';
import { useAppTheme } from '../lib/ThemeProvider';

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
  const { theme } = useAppTheme();
  const isLoggedIn = !!user;

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b backdrop-blur-xl px-4 sm:px-6 py-3 transition-colors duration-300"
      style={{ borderColor: theme.cardBorder, background: theme.headerBg }}
    >
      <div className="flex items-center gap-3">
        <button
          id="hamburger-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="inline-flex md:hidden items-center justify-center p-2 -ml-2 rounded-lg active:scale-95 transition-all duration-150"
          style={{ color: theme.muted }}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
            style={{
              background: theme.accentSoftBg,
              border: `1px solid ${theme.cardBorder}`,
            }}
          >
            <Rocket className="h-3.5 w-3.5" style={{ color: theme.accentText }} strokeWidth={2} />
          </span>
          <span className="text-sm font-bold tracking-tight" style={{ fontFamily: FONT_HEADING, color: theme.heading }}>
            Hail<span style={{ color: theme.accentText }}>Mary</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <span className="hidden sm:block text-[10px] font-mono uppercase tracking-wider" style={{ color: theme.dim }}>
              {user?.email?.split('@')[0]}
            </span>
            <button
              onClick={signOut}
              className="text-xs font-mono transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: theme.muted }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
            className="text-xs font-bold px-4 py-2 rounded-full border transition-all duration-150 active:scale-95"
            style={{ background: theme.bgBase, borderColor: theme.accentText, color: theme.accentText }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default TopNav;
