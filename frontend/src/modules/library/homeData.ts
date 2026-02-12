import type { ImageElement, PosterElement, TextElement } from '@/core/models/element'
import type { Poster, PosterFormat } from '@/core/models/poster'
import type { Template } from '@/core/models/template'

export type ProjectScope = 'mine' | 'shared'
export type BrandKitId = 'hs_standard' | 'medieninformatik' | 'no_brand'
export type FormatCategory = 'all' | 'social' | 'print'
export type FormatPreviewType = 'portrait' | 'square' | 'landscape'

export interface HomeProject {
  id: string
  name: string
  format: PosterFormat
  updatedAt: string
  tag: string
  scope: ProjectScope
  brandKitId?: BrandKitId
  templateId?: string
  collaborator?: string
}

export interface BrandKit {
  id: BrandKitId
  name: string
  subtitle: string
  badge: string
}

export interface BrandKitDefaults {
  titleSize: number
  titleWeight: 'normal' | 'bold'
  titleColor: string
  bodySize: number
  bodyColor: string
  textAlign: 'left' | 'center' | 'right'
  accentColor: string
  backgroundColor: string
}

export interface FormatPreset {
  id: string
  name: string
  sizeLabel: string
  posterFormat: PosterFormat
  previewType: FormatPreviewType
  category: FormatCategory
  recommended?: boolean
}

export interface HomeTemplateItem {
  template: Template
  previewLabel: string
  brandKitId: BrandKitId
}

const FONT_PT_SANS = '"PT Sans", sans-serif'

export const BRAND_KITS: BrandKit[] = [
  {
    id: 'hs_standard',
    name: 'Hochschule Standard',
    subtitle: 'Hauptmarke',
    badge: 'HS'
  },
  {
    id: 'medieninformatik',
    name: 'Medieninformatik',
    subtitle: 'Sekundärmarke',
    badge: 'MI'
  },
  {
    id: 'no_brand',
    name: 'Kein Brand Kit',
    subtitle: 'Leeres Design',
    badge: '⊘'
  }
]

export const BRAND_KIT_DEFAULTS: Record<BrandKitId, BrandKitDefaults> = {
  hs_standard: {
    titleSize: 30,
    titleWeight: 'bold',
    titleColor: '#2B2B2B',
    bodySize: 14,
    bodyColor: '#4b4758',
    textAlign: 'center',
    accentColor: '#dd1166',
    backgroundColor: '#ffffff'
  },
  medieninformatik: {
    titleSize: 34,
    titleWeight: 'bold',
    titleColor: '#2B2B2B',
    bodySize: 15,
    bodyColor: '#3c3651',
    textAlign: 'left',
    accentColor: '#5952e1',
    backgroundColor: '#f7f4fb'
  },
  no_brand: {
    titleSize: 27,
    titleWeight: 'normal',
    titleColor: '#2B2B2B',
    bodySize: 14,
    bodyColor: '#4b4758',
    textAlign: 'left',
    accentColor: '#9313ce',
    backgroundColor: '#ffffff'
  }
}

export const FORMAT_PRESETS: FormatPreset[] = [
  {
    id: 'story_poster',
    name: 'Story / Poster',
    sizeLabel: '1080 x 1920 px',
    posterFormat: 'Flyer',
    previewType: 'portrait',
    category: 'social',
    recommended: true
  },
  {
    id: 'instagram_post',
    name: 'Instagram Post',
    sizeLabel: '1080 x 1080 px',
    posterFormat: 'A4',
    previewType: 'square',
    category: 'social'
  },
  {
    id: 'presentation',
    name: 'Präsentation',
    sizeLabel: '1920 x 1080 px',
    posterFormat: 'A4 Landscape',
    previewType: 'landscape',
    category: 'social'
  },
  {
    id: 'a4_portrait',
    name: 'A4 Hochformat',
    sizeLabel: '210 x 297 mm',
    posterFormat: 'A4',
    previewType: 'portrait',
    category: 'print'
  },
  {
    id: 'a4_landscape',
    name: 'A4 Querformat',
    sizeLabel: '297 x 210 mm',
    posterFormat: 'A4 Landscape',
    previewType: 'landscape',
    category: 'print'
  },
  {
    id: 'custom_layout',
    name: 'Benutzerdefiniert',
    sizeLabel: 'Eigene Maße',
    posterFormat: 'A3',
    previewType: 'portrait',
    category: 'all'
  }
]

const TEMPLATE_PRESETS = [
  {
    id: 'tpl_hs_story',
    name: 'TH Story Intro',
    format: 'Flyer' as const,
    previewLabel: 'Story 9:16',
    subtitle: 'Hochschule Design',
    brandKitId: 'hs_standard' as const
  },
  {
    id: 'tpl_hs_a4',
    name: 'TH Event A4',
    format: 'A4' as const,
    previewLabel: 'Poster 9:16',
    subtitle: 'Informationsposter',
    brandKitId: 'hs_standard' as const
  },
  {
    id: 'tpl_mi_launch',
    name: 'MI Produktlaunch',
    format: 'A4 Landscape' as const,
    previewLabel: 'Header 21:9',
    subtitle: 'Tech Hero',
    brandKitId: 'medieninformatik' as const
  },
  {
    id: 'tpl_mi_social',
    name: 'MI Social Update',
    format: 'A4' as const,
    previewLabel: 'Social 1:1',
    subtitle: 'Kampagne',
    brandKitId: 'medieninformatik' as const
  },
  {
    id: 'tpl_clean_blank',
    name: 'Clean Blank',
    format: 'A4' as const,
    previewLabel: 'Leeres Layout',
    subtitle: 'Neutral',
    brandKitId: 'no_brand' as const
  },
  {
    id: 'tpl_clean_print',
    name: 'Clean Print',
    format: 'A4 Landscape' as const,
    previewLabel: 'Print 16:9',
    subtitle: 'Minimal',
    brandKitId: 'no_brand' as const
  }
]

export const TEMPLATE_LIBRARY_ITEMS: HomeTemplateItem[] = TEMPLATE_PRESETS.map((preset) => ({
  template: createTemplateFromPreset(preset.id, preset.name, preset.format, preset.subtitle, preset.brandKitId),
  previewLabel: preset.previewLabel,
  brandKitId: preset.brandKitId
}))

export function getBrandKitDefaults(id: BrandKitId): BrandKitDefaults {
  return BRAND_KIT_DEFAULTS[id]
}

export function getTemplatesForBrandKit(brandKitId: BrandKitId) {
  return TEMPLATE_LIBRARY_ITEMS.filter((item) => item.brandKitId === brandKitId)
}

export function applyBrandKitToTemplate(template: Template, brandKitId: BrandKitId): Template {
  const defaults = getBrandKitDefaults(brandKitId)
  return {
    ...template,
    pages: template.pages.map((page) => ({
      ...page,
      elements: page.elements.map((element) => styleElementForBrandKit(element, defaults))
    }))
  }
}

export function applyBrandKitToPoster(poster: Poster, brandKitId: BrandKitId, projectName: string): Partial<Poster> {
  const defaults = getBrandKitDefaults(brandKitId)
  return {
    meta: {
      ...poster.meta,
      title: projectName
    },
    backgroundColor: defaults.backgroundColor,
    pages: poster.pages.map((page) => ({
      ...page,
      elements: page.elements.map((element) => styleElementForBrandKit(element, defaults))
    }))
  }
}

export function createMockProjects(now = Date.now()): HomeProject[] {
  return [
    buildProject('Sommerfest 2025', 'A4', 'Poster 9:16', 'mine', now - 2 * 60 * 60 * 1000, 'hs_standard', 'tpl_hs_a4'),
    buildProject('Insta', 'A4', 'Social 1:1', 'mine', now - 24 * 60 * 60 * 1000, 'medieninformatik', 'tpl_mi_social'),
    buildProject('Website Hero V2', 'Flyer', 'Banner 16:9', 'mine', now - 2 * 24 * 60 * 60 * 1000, 'medieninformatik', 'tpl_mi_launch'),
    buildProject(
      'Ausstellung "Zukunft"',
      'A4',
      'A1 Plakat',
      'shared',
      now - 3 * 24 * 60 * 60 * 1000,
      'hs_standard',
      'tpl_hs_a4',
      'Markus B.'
    ),
    buildProject('Pitch Deck Template', 'A4 Landscape', 'Folie 4:3', 'mine', now - 5 * 24 * 60 * 60 * 1000, 'no_brand', 'tpl_clean_print'),
    buildProject(
      'LinkedIn Cover Team',
      'A4 Landscape',
      'Header 21:9',
      'shared',
      now - 8 * 24 * 60 * 60 * 1000,
      'medieninformatik',
      'tpl_mi_launch',
      'Julia W.'
    ),
    buildProject('Icon Set Cover', 'A4', 'Quadratisch', 'mine', now - 10 * 24 * 60 * 60 * 1000, 'no_brand', 'tpl_clean_blank'),
    buildProject('App Splash Screen', 'Flyer', 'Mobile 9:16', 'shared', now - 12 * 24 * 60 * 60 * 1000, 'hs_standard', 'tpl_hs_story', 'Raj P.')
  ]
}

function buildProject(
  name: string,
  format: PosterFormat,
  tag: string,
  scope: ProjectScope,
  timestampMs: number,
  brandKitId: BrandKitId,
  templateId?: string,
  collaborator?: string
): HomeProject {
  return {
    id: crypto.randomUUID(),
    name,
    format,
    tag,
    scope,
    brandKitId,
    templateId,
    collaborator,
    updatedAt: new Date(timestampMs).toISOString()
  }
}

function createTemplateFromPreset(
  id: string,
  name: string,
  format: PosterFormat,
  subtitle: string,
  brandKitId: BrandKitId
): Template {
  const defaults = getBrandKitDefaults(brandKitId)
  const { widthMm, heightMm } = getFormatSize(format)

  const headerImage: ImageElement = {
    id: `${id}-image`,
    type: 'image',
    name: 'Header',
    xMm: 0,
    yMm: 0,
    widthMm,
    heightMm: Math.round(heightMm * 0.34),
    rotationDeg: 0,
    locked: false,
    assetId: '',
    fit: 'cover',
    src: `https://placehold.co/960x520/${defaults.accentColor.replace('#', '')}/ffffff?text=${encodeURIComponent(name)}`
  }

  const titleText: TextElement = {
    id: `${id}-title`,
    type: 'text',
    name: 'Titel',
    xMm: defaults.textAlign === 'center' ? 0 : 12,
    yMm: Math.round(heightMm * 0.34),
    widthMm: defaults.textAlign === 'center' ? widthMm : Math.round(widthMm * 0.8),
    heightMm: 22,
    rotationDeg: 0,
    locked: false,
    text: name,
    variant: 'title',
    align: defaults.textAlign,
    fontSize: defaults.titleSize,
    fontFamily: FONT_PT_SANS,
    color: defaults.titleColor,
    fontWeight: defaults.titleWeight,
    fontStyle: 'normal',
    backgroundColor: 'transparent'
  }

  const subtitleText: TextElement = {
    id: `${id}-subtitle`,
    type: 'text',
    name: 'Untertitel',
    xMm: defaults.textAlign === 'center' ? 0 : 12,
    yMm: Math.round(heightMm * 0.45),
    widthMm: defaults.textAlign === 'center' ? widthMm : Math.round(widthMm * 0.75),
    heightMm: 14,
    rotationDeg: 0,
    locked: false,
    text: subtitle,
    variant: 'body',
    align: defaults.textAlign,
    fontSize: defaults.bodySize,
    fontFamily: FONT_PT_SANS,
    color: defaults.bodyColor,
    fontWeight: 'normal',
    fontStyle: 'normal',
    backgroundColor: 'transparent'
  }

  return {
    id,
    name,
    format,
    allowedZones: [],
    pages: [
      {
        elements: [headerImage, titleText, subtitleText]
      }
    ]
  }
}

function styleElementForBrandKit(element: PosterElement, defaults: BrandKitDefaults): PosterElement {
  if (element.type !== 'text') return element
  return {
    ...element,
    fontFamily: FONT_PT_SANS,
    color: element.variant === 'title' ? defaults.titleColor : defaults.bodyColor,
    fontWeight: element.variant === 'title' ? defaults.titleWeight : 'normal',
    fontSize: element.variant === 'title' ? defaults.titleSize : defaults.bodySize,
    align: element.variant === 'title' ? defaults.textAlign : element.align
  }
}

function getFormatSize(format: PosterFormat) {
  if (format === 'Flyer') return { widthMm: 100, heightMm: 210 }
  if (format === 'A3') return { widthMm: 297, heightMm: 420 }
  if (format === 'A2') return { widthMm: 420, heightMm: 594 }
  if (format === 'A4 Landscape') return { widthMm: 297, heightMm: 210 }
  return { widthMm: 210, heightMm: 297 }
}
