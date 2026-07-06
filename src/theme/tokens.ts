/**
 * Global design tokens — the single source of truth for every color, distance,
 * duration, ratio, and physics constant used anywhere in the app.
 *
 * Zero Magic Numbers Rule: no component may contain a raw numeric literal that
 * describes visual design; it must reference a named token from this file.
 */
export const TOKENS = {
  colors: {
    background: '#111317',
    surface: 'rgba(30, 34, 43, 0.6)',
    surfaceBorder: 'rgba(255, 255, 255, 0.1)',
    cellIdle: 'rgba(255, 255, 255, 0.05)',
    cellPressed: 'rgba(255, 255, 255, 0.12)',
    playerX: '#00f0ff', // Cyber Cyan
    playerO: '#ff24e4', // Neon Magenta
    textMain: '#e2e2e8',
    textMuted: '#8b93a3',
    winHighlight: '#ffffff',
    strikeCore: '#ffffff',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12, // Standard game board gap
    lg: 16,
    xl: 24,
    xxl: 32,
    screenPadding: 24,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },

  typography: {
    sizes: {
      labelSm: 11,
      labelCaps: 12,
      bodyMd: 16,
      statValue: 22,
      headlineLg: 32,
    },
    weights: {
      regular: '400',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    letterSpacing: {
      caps: 2,
      title: 6,
    },
  },

  animation: {
    springDamping: 12,
    springStiffness: 150,
    drawLineMs: 400,
    aiThinkingDelayMs: 450,
    cellStaggerMs: 40,
    thinkingPulseMs: 600,
    /** Bouncy elastic ease used when drawing markers (cubic-bezier control points). */
    markerEase: { x1: 0.175, y1: 0.885, x2: 0.32, y2: 1.275 },
    /** Starting scale/opacity for pop-in entrances. */
    popInFromScale: 0.4,
    pressedScale: 0.94,
    idleScale: 1,
  },

  /** Geometry ratios for board rendering — all relative to the cell size. */
  board: {
    cellBorderWidth: 1,
    maxBoardSize: 420,
    markerStrokeRatio: 0.12,
    markerInsetRatio: 0.25,
    markerRadiusRatio: 0.3,
    markerGlowBlur: 10,
    strikeAuraWidth: 10,
    strikeAuraBlur: 8,
    strikeCoreWidth: 3,
    strikeCoreGlowBlur: 5,
  },

  /** Uniform-style constants injected into the SkSL background shader. */
  shader: {
    pulseSpeed: 0.75,
    pulseAmplitude: 0.08,
    glowFalloffBias: 0.4,
    glowIntensity: 0.12,
    baseColor: { r: 0.06, g: 0.07, b: 0.09 },
    glowColor: { r: 0.0, g: 0.94, b: 1.0 },
    msPerSecond: 1000,
  },

  game: {
    defaultGridSize: 3,
    gridSizeOptions: [3, 4, 5],
  },
} as const;

export type ThemeTokens = typeof TOKENS;
