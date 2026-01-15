import type { PosterFormat } from './poster';
import type { PosterElement } from './element';

export interface AllowedZone {
  role: 'title' | 'text' | 'image' | 'logo';
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  editable: boolean;
}

export interface Template {
  id: string;
  name: string;
  format: PosterFormat;
  allowedZones: AllowedZone[];
  pages: { elements: PosterElement[] }[]; // Changed to pages
  thumbnail?: string; // Optional URL or base64 for preview
}
