import { motion } from 'motion/react';
import type { Transition } from 'motion/react';

interface TextRevealProps {
  text: string;
  className?: string;
  /** Base delay before the first character starts (seconds). */
  delay?: number;
  /** Gap between each character animation (seconds). */
  stagger?: number;
}

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/**
 * Stagger-reveals each character of `text` using a fade + y animation.
 * Renders as an inline <span> so it works inside headings.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.028,
}: TextRevealProps) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((char, i) => {
        const transition: Transition = {
          duration: 0.35,
          delay: delay + i * stagger,
          ease: EASE,
        };

        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}
