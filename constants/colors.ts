/**
 * Hair Bounty Care Brand Colors
 * Extracted from the website branding
 */

export const colors = {
  // Primary Browns
  brown: {
    900: '#2a1f1a',    // Darkest (backgrounds, footer)
    800: '#3F2D25',    // Primary background
    700: '#5A4A3A',    // Lighter background (hero)
    600: '#7a6a5a',    // Subtle elements
  },

  // Accent Golds
  gold: {
    500: '#D2994A',    // Primary accent (buttons, highlights)
    400: '#C79745',    // Hover states
    300: '#C9764D',    // Secondary accent (warm copper)
  },

  // Text Colors
  white: '#FFFFFF',
  cream: '#e8e0d5',

  // Semantic Colors
  success: '#34D399',     // Emerald for eco/sustainability
  error: '#EF4444',       // Red for errors
  warning: '#F59E0B',     // Amber for warnings
  info: '#3B82F6',        // Blue for info

  // Opacity Helpers (use with opacity prop or alpha channel)
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
