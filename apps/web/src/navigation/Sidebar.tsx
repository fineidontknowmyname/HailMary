import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NAV_GROUPS, type NavItem } from './navConfig';
import { sidebarVariants, sidebarTransition } from '../lib/motion';
import { FONT_HEADING, type AppTheme } from '../lib/theme';
import { useAppTheme } from '../lib/ThemeProvider';

interface NavLinkItemProps {
  item: NavItem;
  theme: AppTheme;
  onClick?: () => void;
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({ item, theme, onClick }) => {
  const { icon: Icon, label, path, description } = item;
  const location = useLocation();

  const isActive =
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  return (
    <NavLink
      to={path}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      title={description}
      className="group relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150 outline-none focus-visible:ring-2"
      style={{
        color: isActive ? theme.heading : theme.muted,
        background: isActive ? theme.accentSoftBg : 'transparent',
      }}
    >
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full"
          style={{ background: theme.accentText }}
        />
      )}
      <motion.span
        className="shrink-0 flex items-center justify-center"
        whileHover={{ scale: 1.12 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <Icon
          className="h-[18px] w-[18px]"
          style={{ color: isActive ? theme.accentText : undefined }}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
      </motion.span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
};

interface SidebarNavContentProps {
  theme: AppTheme;
  onItemClick?: () => void;
}

const SidebarNavContent: React.FC<SidebarNavContentProps> = ({ theme, onItemClick }) => (
  <nav className="flex flex-col gap-5 px-3 py-4" aria-label="Global navigation">
    {NAV_GROUPS.map((group, gi) => (
      <div key={gi} className="flex flex-col gap-0.5">
        {group.heading && (
          <p
            className="text-[10px] uppercase tracking-widest font-semibold mb-3 mt-8 px-4 select-none"
            style={{ color: theme.dim }}
          >
            {group.heading}
          </p>
        )}
        {group.items.map((item) => (
          <NavLinkItem key={item.key} item={item} theme={theme} onClick={onItemClick} />
        ))}
      </div>
    ))}
  </nav>
);

const SidebarFooter: React.FC<{ theme: AppTheme }> = ({ theme }) => (
  <div className="mt-auto border-t px-4 py-4" style={{ borderColor: theme.cardBorder }}>
    <div className="flex items-center gap-2 rounded-xl px-2 py-2 mb-3">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
        style={{ background: theme.accentSoftBg, color: theme.accentText }}
      >
        U
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-mono truncate" style={{ color: theme.dim }}>v1.0 · Beta</span>
      </div>
    </div>

    <div className="flex items-end gap-[3px] h-4 px-2" aria-hidden="true">
      {[6, 11, 8, 14, 7, 10, 5].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: theme.accentText }}
          animate={{ height: [h, h * 0.35, h] }}
          transition={{ duration: 1.1 + (i % 3) * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
        />
      ))}
    </div>
  </div>
);

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { theme } = useAppTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="sidebar"
          className="fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col backdrop-blur-xl transition-colors duration-300"
          style={{ background: theme.bgPanel, borderColor: theme.cardBorder, boxShadow: theme.shadowPanel }}
          variants={sidebarVariants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={sidebarTransition}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: theme.cardBorder }}>
            <span className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: FONT_HEADING, color: theme.heading }}>Menu</span>
            <motion.button
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              className="flex items-center justify-center h-8 w-8 rounded-lg transition-colors duration-150"
              style={{ background: theme.accentSoftBg, color: theme.muted }}
              whileTap={{ scale: 0.88 }}
              whileHover={{ color: theme.heading }}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarNavContent theme={theme} onItemClick={() => setIsOpen(false)} />
          </div>
          <SidebarFooter theme={theme} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
export default Sidebar;
