/** Canonical design tokens — source of truth for landing + app UI kit */

export const kit = {
  color: {
    obsidian: '#09090b',
    graphite: '#18181b',
    slate: '#27272a',
    iron: '#3f3f46',
    steel: '#52525b',
    fog: '#71717a',
    ash: '#a1a1aa',
    mist: '#d4d4d8',
    cloud: '#ececee',
    paper: '#f4f4f5',
    snow: '#ffffff',
    ember: '#ff5a00',
    magenta: '#fe45e2',
    canvas: '#f4f4f5',
    card: '#ffffff',
    subtle: '#fafafa',
    border: '#ececee',
    ink: '#09090b',
    body: '#18181b',
    muted: '#52525b',
    faint: '#71717a',
    accent: '#ff5a00',
    darkSurface: '#18181b',
    darkCard: '#27272a',
    success: '#3f7d4e',
    successBg: '#f0f7f2',
    successBorder: '#c5dbc9',
  },
  radius: {
    card: '36px',
    panel: '20px',
    button: '14px',
    badge: '12px',
    pill: '10000px',
    input: '14px',
  },
  space: {
    /** Named scale (px) — use for layout rhythm */
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
    11: 64,
    12: 80,
    sectionGap: 80,
    cardPadding: 28,
    /** MUI spacing units for KitContainer / page gutters */
    pageX: { xs: 2.5, sm: 4, md: 5 },
  },
  layout: {
    maxWidth: 1200,
    sidebarWidth: 240,
  },
  shadow: {
    primary:
      'inset 0 0.5px 0 0 rgba(255,255,255,0.5), inset 0 9px 14px -5px rgba(117,123,133,0.4), 0 0 0 1.5px rgb(44,46,52), 0 4px 6px 0 rgba(0,0,0,0.14)',
    soft: '0 12px 32px rgba(9, 9, 11, 0.08)',
    small: '0 2px 8px rgba(9, 9, 11, 0.06)',
    medium: '0 8px 24px rgba(9, 9, 11, 0.08)',
    large: '0 16px 40px rgba(9, 9, 11, 0.12)',
  },
  border: {
    hairline: `1px solid #ececee`,
    strong: `1px solid #d4d4d8`,
    focus: `1px solid #09090b`,
    accent: `1.5px solid #2c2e34`,
  },
  size: {
    controlSm: 36,
    controlMd: 44,
    controlLg: 52,
    iconSm: 16,
    iconMd: 20,
    iconLg: 24,
  },
  font: {
    sans: '"OS Studio Grotesk", "DM Sans", ui-sans-serif, system-ui, -apple-system, sans-serif',
    display: '"OS Studio Grotesk", ui-sans-serif, system-ui, sans-serif',
  },
  typography: {
    display: {
      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.12,
    },
    sectionTitle: {
      fontSize: { xs: '2rem', md: '2.5rem' },
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.28,
    },
    pageTitle: {
      fontSize: { xs: '1.5rem', md: '1.75rem' },
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    body: {
      fontSize: '0.9375rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.8125rem',
      lineHeight: 1.45,
    },
  },
} as const;

export type KitColor = keyof typeof kit.color;
export type KitRadius = keyof typeof kit.radius;

/** @deprecated Prefer `kit`. Kept for landing/app compatibility. */
export const LANDING = {
  obsidian: kit.color.obsidian,
  graphite: kit.color.graphite,
  slate: kit.color.slate,
  iron: kit.color.iron,
  steel: kit.color.steel,
  fog: kit.color.fog,
  ash: kit.color.ash,
  mist: kit.color.mist,
  cloud: kit.color.cloud,
  paper: kit.color.paper,
  snow: kit.color.snow,
  ember: kit.color.ember,
  magentaSpark: kit.color.magenta,
  canvas: kit.color.canvas,
  card: kit.color.card,
  subtle: kit.color.subtle,
  border: kit.color.border,
  ink: kit.color.ink,
  body: kit.color.body,
  muted: kit.color.muted,
  faint: kit.color.faint,
  accent: kit.color.accent,
  darkSurface: kit.color.darkSurface,
  darkCard: kit.color.darkCard,
  radiusCard: kit.radius.card,
  radiusButton: kit.radius.button,
  radiusBadge: kit.radius.badge,
  radiusPill: kit.radius.pill,
  maxWidth: kit.layout.maxWidth,
  sectionGap: kit.space.sectionGap,
  cardPadding: kit.space.cardPadding,
  shadowPrimary: kit.shadow.primary,
} as const;

export const landingFont = kit.font.sans;
export const HERO_FONT = kit.font.display;

export const HERO_THEME = {
  canvas: '#ffffff',
  ink: '#0a0a0a',
  subtext: '#6f6f6f',
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.95)',
} as const;
