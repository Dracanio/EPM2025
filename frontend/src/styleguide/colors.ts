// Based on User Request
export const colors = {
  palette: {
    thRed: '#dd1166', // Primary TH Color
    purple: '#9313ce',
    blue: '#5952e1',
    green: '#00ad2f',
    darkGray: '#2B2B2B',
    mediumGray: '#aaaaaa',
    lightGray: '#efefef',
    white: '#ffffff'
  },
  // Mapping to semantic roles for easier usage
  primary: '#dd1166',
  text: '#2B2B2B',
  background: '#ffffff',
  ui: {
    border: '#aaaaaa',
    background: '#efefef',
  }
} as const;

export type ColorPalette = typeof colors;
