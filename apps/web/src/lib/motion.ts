import type { Variants, Transition } from 'motion/react';

/**
 * Shared Motion animation variants & transition presets.
 * Import from here so all animations stay consistent app-wide.
 */

// ─── Transition Presets ────────────────────────────────────────────────────────

export const spring: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 30,
  mass: 0.8,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 38,
};

// Explicitly typed as a cubic-bezier tuple so Framer Motion's Easing type is satisfied.
const BEZIER: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export const ease: Transition = {
  duration: 0.22,
  ease: BEZIER,
};

// ─── Page Transition Variants ─────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export const pageTransition: Transition = { duration: 0.28, ease: BEZIER };

// ─── Modal Variants ───────────────────────────────────────────────────────────

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.97, y: 8  },
};

export const modalTransition: Transition = { duration: 0.22, ease: BEZIER };

// ─── Stagger Container Variants ───────────────────────────────────────────────

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: ease },
};

// ─── Fade-up (generic reveal) ─────────────────────────────────────────────────

// Use the pre-typed `ease` transition constant to avoid Vercel's strict TS
// widening `number[]` → incompatible with Framer Motion's Easing union type.
const fadeUpTransition: Transition = { duration: 0.4, ease: BEZIER };

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: fadeUpTransition },
};

// ─── Sidebar Variants ─────────────────────────────────────────────────────────

export const sidebarVariants: Variants = {
  open:   { x: 0       },
  closed: { x: '-100%' },
};

export const sidebarTransition: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};
