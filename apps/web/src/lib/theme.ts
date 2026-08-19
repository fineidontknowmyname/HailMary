export interface AppTheme {
  mode: 'light' | 'dark';
  bgBase: string;
  bgPanel: string;
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  cardBorderStrong: string;
  heading: string;
  body: string;
  muted: string;
  dim: string;
  accentText: string;
  accentBorder: string;
  accentBorderStrong: string;
  accentSoftBg: string;
  electricText: string;
  inputBg: string;
  inputBorder: string;
  shadowCard: string;
  shadowPanel: string;
}

export const DARK_THEME: AppTheme = {
  mode: 'dark',
  bgBase: '#0A0A0C',
  bgPanel: '#111318',
  headerBg: 'rgba(10,10,12,0.75)',
  cardBg: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(34,211,238,0.22)',
  cardBorderStrong: 'rgba(34,211,238,0.45)',
  heading: '#FFFFFF',
  body: '#C7CBD1',
  muted: '#8A8F98',
  dim: '#5A5F68',
  accentText: '#22D3EE',
  accentBorder: 'rgba(34,211,238,0.35)',
  accentBorderStrong: 'rgba(34,211,238,0.6)',
  accentSoftBg: 'rgba(34,211,238,0.08)',
  electricText: '#60A5FA',
  inputBg: 'rgba(255,255,255,0.03)',
  inputBorder: 'rgba(34,211,238,0.22)',
  shadowCard: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -4px rgba(0,0,0,0.45)',
  shadowPanel: '0 1px 2px rgba(0,0,0,0.5), 0 16px 48px -8px rgba(0,0,0,0.6)',
};

export const LIGHT_THEME: AppTheme = {
  mode: 'light',
  bgBase: '#F4F6F8',
  bgPanel: '#FFFFFF',
  headerBg: 'rgba(255,255,255,0.85)',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(8,145,178,0.2)',
  cardBorderStrong: 'rgba(8,145,178,0.4)',
  heading: '#0B1220',
  body: '#3F4A5A',
  muted: '#6B7684',
  dim: '#9AA3AF',
  accentText: '#0E7490',
  accentBorder: 'rgba(8,145,178,0.3)',
  accentBorderStrong: 'rgba(8,145,178,0.5)',
  accentSoftBg: 'rgba(8,145,178,0.08)',
  electricText: '#2563EB',
  inputBg: '#FFFFFF',
  inputBorder: 'rgba(8,145,178,0.2)',
  shadowCard: '0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -4px rgba(16,24,40,0.08)',
  shadowPanel: '0 1px 2px rgba(16,24,40,0.05), 0 16px 48px -8px rgba(16,24,40,0.12)',
};

export const FONT_HEADING = "'Sora', sans-serif";
export const FONT_BODY = "'Manrope', sans-serif";

export const GLASS_CARD_CLASS =
  'relative rounded-2xl border backdrop-blur-xl transition-colors duration-200';

export function glassCardStyle(theme: AppTheme): React.CSSProperties {
  return { background: theme.cardBg, borderColor: theme.cardBorder, boxShadow: theme.shadowCard };
}

export function accentHoverShadow(theme: AppTheme): string {
  const ring = theme.mode === 'dark' ? 'rgba(34,211,238,0.18)' : 'rgba(8,145,178,0.16)';
  const glow = theme.mode === 'dark' ? 'rgba(34,211,238,0.1)' : 'rgba(8,145,178,0.08)';
  return `0 0 0 1px ${ring}, 0 10px 28px -6px ${glow}, ${theme.shadowCard}`;
}

export const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";

export const DOT_GRID_BG =
  'radial-gradient(circle, rgba(34,211,238,0.35) 1px, transparent 1px)';
