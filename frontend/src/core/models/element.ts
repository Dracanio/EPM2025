export type ElementType = 'text' | 'image' | 'latex';

export interface PosterElementBase {
  id: string;
  type: ElementType;
  name: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotationDeg: number;
  locked: boolean;
}

export interface TextElement extends PosterElementBase {
  type: 'text';
  text: string;
  variant: 'title' | 'subtitle' | 'body';
  align: 'left' | 'center' | 'right';
  fontSize: number; // Added for rendering
  fontFamily: string; // Added for rendering
  color: string; // Added for rendering
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  backgroundColor: string; // 'transparent' or hex
}

export interface ImageElement extends PosterElementBase {
  type: 'image';
  assetId: string; // ID referencing an Asset
  src?: string; // Optional direct URL for preview if assetId not resolved immediately
  fit: 'contain' | 'cover';
}

export interface LatexElement extends PosterElementBase {
  type: 'latex';
  latex: string;
}

export type PosterElement = TextElement | ImageElement | LatexElement;
