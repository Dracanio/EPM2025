export const typography = {
  fontFamily: {
    headings: '"PT Sans", sans-serif',
    body: '"PT Sans", sans-serif',
  },
  weights: {
    regular: 400,
    bold: 700,
  },
  sizes: {
    presentationTitle: 27,
    slideTitle: 21,
    headline: 17,
    body: 17,
    caption: 14,
  },
  lineHeights: {
    tight: 0.9, // 90%
    normal: 1.0, // 100%
  }
} as const;

export const textVariants = {
  title: {
    fontFamily: typography.fontFamily.headings,
    fontSize: typography.sizes.presentationTitle,
    fontWeight: 'bold', // mapped to string for Konva/CSS
    lineHeight: typography.lineHeights.tight
  },
  subtitle: {
    fontFamily: typography.fontFamily.headings,
    fontSize: typography.sizes.slideTitle,
    fontWeight: 'bold',
    lineHeight: typography.lineHeights.tight
  },
  body: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.body,
    fontWeight: 'normal',
    lineHeight: typography.lineHeights.normal
  },
  caption: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.sizes.caption,
    fontWeight: 'normal',
    lineHeight: typography.lineHeights.normal
  }
} as const;
