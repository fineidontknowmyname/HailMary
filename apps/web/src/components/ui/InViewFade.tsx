import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import type { Transition } from 'motion/react';

interface InViewFadeProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in seconds before this element starts animating. */
  delay?: number;
  /** y offset to animate from (default 20px). */
  yOffset?: number;
}

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/**
 * Wraps children in a motion.div that fades + slides up into view
 * when the element enters the viewport (fires once).
 */
export function InViewFade({
  children,
  className,
  delay = 0,
  yOffset = 20,
}: InViewFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const transition: Transition = {
    duration: 0.5,
    delay,
    ease: EASE,
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
