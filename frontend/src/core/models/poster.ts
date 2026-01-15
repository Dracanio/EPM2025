import type { PosterElement } from './element';

export type PosterFormat = 'A4' | 'A3' | 'A2';

export interface PosterMeta {
  title: string;
  ownerId: string;
}

export interface Poster {
  id: string;
  templateId?: string;
  format: PosterFormat;
  elements: PosterElement[];
  meta: PosterMeta;
}
