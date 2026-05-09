import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { NAV_GROUPS, type NavItem } from './navConfig';

// ─── Constants ────────────────────────────────────────────────────────────────
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
      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#4fffb0]/50 ${
        isActive
          ? 'text-white bg-white/10'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon
        className="h-[18px] w-[18px]"
        style={{ color: isActive ? ACCENT : undefined }}
        strokeWidth={isActive ? 2.2 : 1.8}
      />
      <span className="truncate">{label}</span>
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
          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-3 mt-8 px-4 select-none">
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

// ─── Main Sidebar Component ───────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64
        bg-[#0b0f19] border-r border-white/10 shadow-2xl
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <span className="text-sm font-bold uppercase tracking-wider text-white">Menu</span>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation menu"
          className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-150 active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <SidebarNavContent onItemClick={() => setIsOpen(false)} />
      </div>
      <SidebarFooter />
    </aside>
  );
};
export default Sidebar;
