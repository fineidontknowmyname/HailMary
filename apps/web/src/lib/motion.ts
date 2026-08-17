/**
 * Shared Motion animation variants & transition presets.
 * Import from here so all animations stay consistent app-wide.
 */

// ─── Transition Presets ────────────────────────────────────────────────────────

export const spring = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 30,
  mass: 0.8,
};

export const springSnappy = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 38,
};

export const ease = {
  duration: 0.22,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

// ─── Page Transition Variants ─────────────────────────────────────────────────

export const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export const pageTransition = { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] };

// ─── Modal Variants ───────────────────────────────────────────────────────────

export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

export const modalVariants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.97, y: 8  },
};

export const modalTransition = { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] };

// ─── Stagger Container Variants ───────────────────────────────────────────────

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: ease },
};

// ─── Fade-up (generic reveal) ─────────────────────────────────────────────────

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Sidebar Variants ─────────────────────────────────────────────────────────

export const sidebarVariants = {
  open:   { x: 0     },
  closed: { x: '-100%' },
};

export const sidebarTransition = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};
