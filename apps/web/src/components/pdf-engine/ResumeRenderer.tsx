'use client';

// ─── ResumeRenderer — Client-side PDF viewer & control layer ─────────────────
//
// PDFViewer requires browser APIs (canvas, blob URLs), so this component:
//  1. Declares 'use client' for Next.js App Router compatibility.
//  2. Defers rendering until after hydration to avoid SSR mismatches.
//  3. Wraps TemplateFAANG inside a full-viewport PDFViewer.

import { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import type { HailMaryResumeData } from './types';
import { TemplateFAANG } from './templates/TemplateFAANG';

interface ResumeRendererProps {
  data: HailMaryResumeData;
}

export function ResumeRenderer({ data }: ResumeRendererProps) {
  // ── Hydration guard ─────────────────────────────────────────────────────────
  // PDFViewer relies on browser-only APIs (canvas, Blob).
  // We delay rendering until after the first client-side paint to prevent
  // SSR mismatch errors in Next.js and flash-of-empty in Vite SSR.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#13161e',
          color: '#6b7280',
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.8rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        Compiling PDF…
      </div>
    );
  }

  // ── Live viewer ─────────────────────────────────────────────────────────────
  return (
    <PDFViewer
      width="100%"
      height="100%"
      showToolbar={true}
      style={{ border: 'none' }}
    >
      <TemplateFAANG data={data} />
    </PDFViewer>
  );
}
