import { useEffect, useRef, useState } from 'react';

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useModalFocusTrap<T extends HTMLElement>(active = true) {
  const containerRef = useRef<T>(null);
  const [previouslyFocused, setPreviouslyFocused] = useState<HTMLElement | null>(
    () => (active ? (document.activeElement as HTMLElement | null) : null)
  );
  const [prevActive, setPrevActive] = useState(active);

  if (active !== prevActive) {
    setPrevActive(active);
    if (active) {
      setPreviouslyFocused(document.activeElement as HTMLElement | null);
    }
  }

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusables[0] ?? container).focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((el) => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, [active, previouslyFocused]);

  return containerRef;
}
