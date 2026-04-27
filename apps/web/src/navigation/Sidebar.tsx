import React, { useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Rocket } from 'lucide-react';
import { NAV_GROUPS, type NavItem } from './navConfig';

// ─── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_WIDTH = 'w-[240px]';
const ACCENT = '#4fffb0';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavLinkItemProps {
  item: NavItem;
  onClick?: () => void;
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({ item, onClick }) => {
  const { icon: Icon, label, path } = item;
  const location = useLocation();

  // Exact match for root, prefix match for sub-routes
  const isActive =
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <NavLink
      to={path}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
        'text-sm font-medium transition-all duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#4fffb0]/50',
        isActive
          ? 'text-[#4fffb0]'
          : 'text-[#7a849a] hover:text-white',
      ].join(' ')}
    >
      {/* Active background glow */}
      {isActive && (
        <span
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(79,255,176,0.10) 0%, rgba(79,255,176,0.04) 100%)',
            boxShadow: `inset 0 0 0 1px rgba(79,255,176,0.15)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Hover background (non-active) */}
      {!isActive && (
        <span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: 'rgba(255,255,255,0.04)' }}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <span className="relative z-10 shrink-0">
        <Icon
          className="h-[18px] w-[18px] transition-transform duration-150 group-hover:scale-110"
          style={{ color: isActive ? ACCENT : undefined }}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
      </span>

      {/* Label */}
      <span className="relative z-10 truncate">{label}</span>

      {/* Active left indicator bar */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full"
          style={{ background: ACCENT }}
          aria-hidden="true"
        />
      )}
    </NavLink>
  );
};

// ─── Sidebar Nav Content (shared between desktop + mobile drawer) ─────────────

interface SidebarNavContentProps {
  onItemClick?: () => void;
}

const SidebarNavContent: React.FC<SidebarNavContentProps> = ({ onItemClick }) => (
  <nav className="flex flex-col gap-5 px-3 py-4" aria-label="Global navigation">
    {NAV_GROUPS.map((group, gi) => (
      <div key={gi} className="flex flex-col gap-0.5">
        {group.heading && (
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#3d4760] select-none">
            {group.heading}
          </p>
        )}
        {group.items.map((item) => (
          <NavLinkItem key={item.key} item={item} onClick={onItemClick} />
        ))}
      </div>
    ))}
  </nav>
);

// ─── Logo / Wordmark ──────────────────────────────────────────────────────────

const SidebarLogo: React.FC = () => (
  <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800/70">
    <span
      className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(79,255,176,0.2) 0%, rgba(79,255,176,0.05) 100%)',
        border: '1px solid rgba(79,255,176,0.25)',
      }}
    >
      <Rocket className="h-4 w-4" style={{ color: ACCENT }} strokeWidth={2} />
    </span>
    <div className="flex flex-col leading-none">
      <span className="text-[13px] font-black tracking-tight text-white">
        Hail<span style={{ color: ACCENT }}>Mary</span>
      </span>
      <span className="text-[9px] font-mono uppercase tracking-widest text-[#3d4760] mt-0.5">
        Launch Platform
      </span>
    </div>
  </div>
);

// ─── Bottom user strip ────────────────────────────────────────────────────────

const SidebarFooter: React.FC = () => (
  <div className="mt-auto border-t border-zinc-800/70 px-4 py-3">
    <div className="flex items-center gap-2 rounded-xl px-2 py-2">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
        style={{ background: 'rgba(79,255,176,0.12)', color: ACCENT }}
      >
        U
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-white truncate">Mission Control</span>
        <span className="text-[10px] font-mono text-[#3d4760] truncate">v1.0 · Beta</span>
      </div>
    </div>
  </div>
);

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────

/** Shows the first 5 nav items as a compact bottom tab bar on small screens. */
const MobileTabBar: React.FC = () => {
  const location = useLocation();
  // Flatten all items and pick first 5 for the tab bar
  const tabItems = NAV_GROUPS.flatMap((g) => g.items).slice(0, 5);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-zinc-800 px-2 py-1 md:hidden"
      style={{ background: 'rgba(11,14,20,0.97)', backdropFilter: 'blur(12px)' }}
      aria-label="Bottom navigation"
    >
      {tabItems.map((item) => {
        const { icon: Icon, label, path, key } = item;
        const isActive =
          path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);
        return (
          <NavLink
            key={key}
            to={path}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 transition-all"
          >
            <Icon
              className="h-5 w-5 transition-colors duration-150"
              style={{ color: isActive ? ACCENT : '#3d4760' }}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span
              className="text-[9px] font-mono font-medium transition-colors duration-150 truncate"
              style={{ color: isActive ? ACCENT : '#3d4760' }}
            >
              {label.split(' ')[0]}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

// ─── Main Sidebar Component ───────────────────────────────────────────────────

export const Sidebar: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setMobileDrawerOpen(false), []);
  const openDrawer = useCallback(() => setMobileDrawerOpen(true), []);

  return (
    <>
      {/* ── Hamburger trigger (visible only md and below) ─────────────── */}
      <button
        id="sidebar-hamburger"
        onClick={openDrawer}
        aria-label="Open navigation menu"
        aria-expanded={mobileDrawerOpen}
        aria-controls="mobile-sidebar-drawer"
        className={[
          'fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl',
          'border border-zinc-800 bg-zinc-950 text-[#7a849a] shadow-lg',
          'transition-all duration-150 hover:border-zinc-700 hover:text-white',
          'md:hidden',
        ].join(' ')}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* ── Mobile off-canvas backdrop ────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile off-canvas drawer ──────────────────────────────────── */}
      <aside
        id="mobile-sidebar-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col',
          SIDEBAR_WIDTH,
          'border-r border-zinc-800/80',
          'transform transition-transform duration-300 ease-in-out md:hidden',
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ background: '#090c12' }}
      >
        <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-4">
          <SidebarLogo />
          <button
            onClick={closeDrawer}
            aria-label="Close navigation menu"
            className="ml-auto text-[#7a849a] hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNavContent onItemClick={closeDrawer} />
        </div>
        <SidebarFooter />
      </aside>

      {/* ── Desktop persistent sidebar ────────────────────────────────── */}
      <aside
        id="desktop-sidebar"
        className={[
          'hidden md:flex flex-col',
          'fixed inset-y-0 left-0 z-30',
          SIDEBAR_WIDTH,
          'border-r border-zinc-800/80',
        ].join(' ')}
        style={{ background: '#090c12' }}
        aria-label="Global navigation"
      >
        <SidebarLogo />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <SidebarNavContent />
        </div>
        <SidebarFooter />
      </aside>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
      <MobileTabBar />
    </>
  );
};

export default Sidebar;
