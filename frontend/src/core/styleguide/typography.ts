export const typography = {
  fonts: {
    // Ideally 'Red Hat Text' or similar if imported
    primary: 'Arial, sans-serif',
    secondary: 'Georgia, serif'
  },
  sizes: {
    title: 48, // pt or px equivalent for A4
    subtitle: 32,
    body: 12,
    caption: 10
  },
  weights: {
    regular: 400,
    bold: 700
  }
} as const;

export const textVariants = {
  title: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold
  },
  subtitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.subtitle,
    fontWeight: typography.weights.regular
  },
  body: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.regular
  }
} as const;
