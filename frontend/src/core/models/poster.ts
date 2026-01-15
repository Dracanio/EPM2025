import type { PosterElement } from './element';

export type PosterFormat = 'A4' | 'A4 Landscape' | 'A3' | 'A2' | 'Flyer';

export interface PosterMeta {
  title: string;
  ownerId: string;
}

export interface PosterPage {
  id: string;
  elements: PosterElement[];
}

export interface Poster {
  id: string;
  templateId?: string;
  format: PosterFormat;
  widthMm: number; // Explicit width
  heightMm: number; // Explicit height
  pages: PosterPage[];
  meta: PosterMeta;
  backgroundColor?: string;
}
