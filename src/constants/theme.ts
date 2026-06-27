import type { TextStyle } from 'react-native';

/**
 * Stacked design tokens.
 * Mirrors STACKED_UI_DESIGN_SYSTEM.md. Solid colors only — no gradients.
 */

export const colors = {
  // Brand
  brandGreen: '#58cc02',
  brandGreenBorder: '#46a302', // 3D button bottom border
  brandGreenOutline: '#a5ed6e', // outline/border ONLY, never fill
  brandGreenLight: '#d7ffb8', // highlight wash ONLY

  // Accent
  accentBlue: '#1cb0f6',
  accentDarkBlue: '#042c68',
  accentMidnight: '#080437',

  // Neutrals
  ink: '#000000',
  graphite: '#3c3c3c',
  charcoal: '#4b4b4b',
  ash: '#777777',

  // Surfaces
  background: '#0d0d0d',
  surface: '#1a1a1a',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  textMuted: '#555555',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { input: 12, button: 16, card: 16, pill: 100 } as const;

/** Font family names as registered by @expo-google-fonts/nunito. */
export const fonts = {
  medium: 'Nunito_500Medium',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const typography = {
  display: { fontFamily: fonts.black, fontSize: 48, letterSpacing: -1 },
  heading: { fontFamily: fonts.extraBold, fontSize: 30, letterSpacing: -0.6 },
  headingSm: { fontFamily: fonts.bold, fontSize: 22 },
  bodyLg: { fontFamily: fonts.medium, fontSize: 17, letterSpacing: 0.3, lineHeight: 26 },
  body: { fontFamily: fonts.bold, fontSize: 15, letterSpacing: 0.3 },
  caption: { fontFamily: fonts.bold, fontSize: 13 },
} satisfies Record<string, TextStyle>;

export const theme = { colors, spacing, radius, fonts, typography } as const;

export type Colors = typeof colors;
export type Typography = typeof typography;
