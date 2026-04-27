import {
  LayoutDashboard,
  UserCircle2,
  Lightbulb,
  Layers,
  FileText,
  ClipboardList,
  Code2,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  /** Unique key used as the React key */
  key: string;
  /** Human-readable label shown in the sidebar */
  label: string;
  /** Route path that maps to this item */
  path: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Optional short description shown on hover tooltips (collapsed mode) */
  description?: string;
}

export interface NavGroup {
  /** Optional visual section heading; omit for the first ungrouped items */
  heading?: string;
  items: NavItem[];
}

/** -----------------------------------------------------------------------
 *  Global navigation configuration for Project Hail Mary.
 *  Order here matches the render order in the Sidebar.
 * ----------------------------------------------------------------------- */
export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        description: 'Home & progress overview',
      },
      {
        key: 'profile',
        label: 'Profile',
        path: '/profile',
        icon: UserCircle2,
        description: 'User settings and stats',
      },
    ],
  },
  {
    heading: 'Build',
    items: [
      {
        key: 'idea-vault',
        label: 'Idea Vault',
        path: '/idea-vault',
        icon: Lightbulb,
        description: 'Project brainstorming and storage',
      },
      {
        key: 'portfolio',
        label: 'Portfolio Builder',
        path: '/portfolio',
        icon: Layers,
        description: 'Project showcase builder',
      },
      {
        key: 'resume',
        label: 'Resume Generator',
        path: '/resume',
        icon: FileText,
        description: 'ATS-friendly resume builder',
      },
    ],
  },
  {
    heading: 'Practice',
    items: [
      {
        key: 'mock-tests',
        label: 'Mock Tests',
        path: '/mock-tests',
        icon: ClipboardList,
        description: 'Corporate MCQ assessments',
      },
      {
        key: 'aptitude',
        label: 'Competitive Aptitude',
        path: '/aptitude',
        icon: Code2,
        description: 'Coding & algorithmic prep',
      },
    ],
  },
  {
    heading: 'Learn',
    items: [
      {
        key: 'tutorials',
        label: 'Tutorials & Labs',
        path: '/tutorials',
        icon: BookOpen,
        description: 'Interactive learning modules',
      },
    ],
  },
];

/** Flat list of all nav items — useful for route registration or search. */
export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
