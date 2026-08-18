import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring } from 'motion/react';

interface AnimatedNumberProps {
  /** The numeric target value to animate to. */
  value: number;
  /** Optional string suffix appended after the number (e.g. "+" or "%"). */
  suffix?: string;
  className?: string;
}

/**
 * Animates a number from 0 -> value using a spring on mount.
 * Renders as a <span> so it can be placed inline anywhere.
 */
export function AnimatedNumber({ value, suffix = '', className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = Math.round(v) + suffix;
      }
    });
    return unsubscribe;
  }, [springValue, suffix]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
