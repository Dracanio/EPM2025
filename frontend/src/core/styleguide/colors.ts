export const colors = {
  primary: {
    DEFAULT: '#CD1719', // TH Köln Red (approx)
    dark: '#A60F12',
    light: '#E63D3F'
  },
  gray: {
    100: '#F5F5F5',
    300: '#E0E0E0',
    500: '#9E9E9E',
    700: '#616161',
    900: '#212121'
  },
  basic: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent'
  }
} as const;

export type ColorPalette = typeof colors;
