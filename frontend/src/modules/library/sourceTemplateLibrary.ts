import type { ImageElement, LatexElement, PosterElement, TextElement } from '@/core/models/element'
import type { PosterFormat } from '@/core/models/poster'
import type { Template } from '@/core/models/template'
import type { BrandKitId, HomeTemplateItem } from './homeData'

const CUSTOM_TEMPLATE_STORAGE_KEY = 'poster_designer_custom_templates_v1'

type PlaceholderType = 'text' | 'image' | 'latex'

interface PlaceholderToken {
  type: PlaceholderType
  key: string
  fallback: string
}

export type TemplateSourceEngine = 'latex' | 'typst'

interface BuiltInSourceTemplatePreset {
  id: string
  name: string
  brandKitId: BrandKitId
  engine: TemplateSourceEngine
  content: string
}

interface DimensionsMm {
  widthMm: number
  heightMm: number
}

const FORMAT_DIMENSIONS: Record<PosterFormat, DimensionsMm> = {
  A4: { widthMm: 210, heightMm: 297 },
  'A4 Landscape': { widthMm: 297, heightMm: 210 },
  A3: { widthMm: 297, heightMm: 420 },
  A2: { widthMm: 420, heightMm: 594 },
  Flyer: { widthMm: 100, heightMm: 210 }
}

const PLACEHOLDER_REGEX = /\{\{\s*(text|image|latex)\s*:\s*([a-zA-Z0-9_-]+)(?:\|([^}]*))?\s*\}\}/g
const FORMAT_HINT_REGEX = /(?:format|poster[_ -]?format)\s*[:=]\s*(A4 Landscape|A4|A3|A2|Flyer)/i

const BUILT_IN_SOURCE_TEMPLATE_PRESETS: BuiltInSourceTemplatePreset[] = [
  {
    id: 'tpl_source_latex_uni_poster',
    name: 'LaTeX Uni Poster',
    brandKitId: 'hs_standard',
    engine: 'latex',
    content: String.raw`% format: A4
\documentclass{article}
\begin{document}
{{text:title|Seminar Poster}}
{{text:subtitle|Informatik Projekt}}
{{image:hero|Hero Bild}}
{{text:body|Kurzbeschreibung des Projekts.}}
{{latex:formula|\int_0^1 x^2 dx = \frac{1}{3}}}
\end{document}`
  },
  {
    id: 'tpl_source_typst_flyer',
    name: 'Typst Event Flyer',
    brandKitId: 'medieninformatik',
    engine: 'typst',
    content: String.raw`// format: Flyer
#set page(width: 100mm, height: 210mm, margin: 0mm)
{{text:title|Tech Meetup 2026}}
{{text:headline|Jetzt anmelden}}
{{image:hero|Speaker Foto}}
{{text:details|Ort: Campus Deutz}}
{{latex:eq|E = mc^2}}`
  }
]

function sanitizeTemplateName(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'Importierte Vorlage'
  return trimmed.slice(0, 80)
}

function normalizeBrandKitId(value: unknown): BrandKitId {
  return value === 'hs_standard' || value === 'medieninformatik' || value === 'no_brand' ? value : 'no_brand'
}

function normalizePosterFormat(value: unknown): PosterFormat {
  return value === 'A4' || value === 'A4 Landscape' || value === 'A3' || value === 'A2' || value === 'Flyer' ? value : 'A4'
}

function normalizeTemplate(value: unknown): Template | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<Template>
  if (typeof candidate.id !== 'string') return null
  if (typeof candidate.name !== 'string') return null
  const format = normalizePosterFormat(candidate.format)

  if (!Array.isArray(candidate.pages)) return null

  const pages = candidate.pages
    .filter((page): page is { elements: PosterElement[] } => {
      if (!page || typeof page !== 'object') return false
      const entry = page as { elements?: unknown }
      return Array.isArray(entry.elements)
    })
    .map((page) => ({
      elements: page.elements
        .filter((element): element is PosterElement => {
          if (!element || typeof element !== 'object') return false
          const entry = element as Partial<PosterElement>
          return (
            typeof entry.id === 'string' &&
            typeof entry.name === 'string' &&
            (entry.type === 'text' || entry.type === 'image' || entry.type === 'latex') &&
            typeof entry.xMm === 'number' &&
            typeof entry.yMm === 'number' &&
            typeof entry.widthMm === 'number' &&
            typeof entry.heightMm === 'number' &&
            typeof entry.rotationDeg === 'number' &&
            typeof entry.locked === 'boolean'
          )
        })
        .map((element) => ({ ...element }))
    }))

  if (pages.length === 0) return null

  const source: Template['source'] =
    candidate.source && typeof candidate.source === 'object'
      ? {
          type: (candidate.source as { type?: unknown }).type === 'typst' ? 'typst' : 'latex',
          content: typeof (candidate.source as { content?: unknown }).content === 'string'
            ? (candidate.source as { content: string }).content
            : '',
          fileName: typeof (candidate.source as { fileName?: unknown }).fileName === 'string'
            ? (candidate.source as { fileName: string }).fileName
            : undefined,
          importedAt: typeof (candidate.source as { importedAt?: unknown }).importedAt === 'string'
            ? (candidate.source as { importedAt: string }).importedAt
            : undefined
        }
      : undefined

  return {
    id: candidate.id,
    name: sanitizeTemplateName(candidate.name),
    format,
    allowedZones: Array.isArray(candidate.allowedZones) ? candidate.allowedZones : [],
    pages,
    source
  }
}

function normalizeHomeTemplateItem(value: unknown): HomeTemplateItem | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<HomeTemplateItem>
  const template = normalizeTemplate(candidate.template)
  if (!template) return null

  return {
    template,
    previewLabel: typeof candidate.previewLabel === 'string' ? candidate.previewLabel : 'Importiert',
    brandKitId: normalizeBrandKitId(candidate.brandKitId)
  }
}

function getStorageKey(userId: string) {
  return `${CUSTOM_TEMPLATE_STORAGE_KEY}_${userId}`
}

export function readStoredCustomTemplateItems(userId: string): HomeTemplateItem[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(getStorageKey(userId))
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((entry) => normalizeHomeTemplateItem(entry)).filter((entry): entry is HomeTemplateItem => entry !== null)
  } catch {
    return []
  }
}

export function writeStoredCustomTemplateItems(userId: string, templates: HomeTemplateItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(templates))
}

export function detectTemplateEngine(fileName: string, content: string): TemplateSourceEngine {
  const lowerFile = fileName.toLowerCase()
  if (lowerFile.endsWith('.typ')) return 'typst'
  if (lowerFile.endsWith('.tex')) return 'latex'

  const lowerContent = content.toLowerCase()
  if (lowerContent.includes('#set page') || lowerContent.includes('= ') || lowerContent.includes('#place')) return 'typst'
  return 'latex'
}

function detectFormat(content: string): PosterFormat {
  const explicit = content.match(FORMAT_HINT_REGEX)?.[1]
  if (explicit) return normalizePosterFormat(explicit)

  const dimensions = content.match(/width\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)\s*mm[^\n]*height\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)\s*mm/i)
  if (!dimensions) return 'A4'

  const width = Number.parseFloat(dimensions[1] || '')
  const height = Number.parseFloat(dimensions[2] || '')
  if (!Number.isFinite(width) || !Number.isFinite(height)) return 'A4'

  let closest: PosterFormat = 'A4'
  let closestDistance = Number.POSITIVE_INFINITY

  for (const [format, size] of Object.entries(FORMAT_DIMENSIONS) as [PosterFormat, DimensionsMm][]) {
    const distance = Math.abs(size.widthMm - width) + Math.abs(size.heightMm - height)
    if (distance < closestDistance) {
      closestDistance = distance
      closest = format
    }
  }

  return closest
}

function placeholderDefaults(type: PlaceholderType, key: string, fallback: string) {
  if (fallback.trim()) return fallback.trim()
  if (type === 'image') return `Bild: ${key}`
  if (type === 'latex') return 'E = mc^2'
  return key.replace(/[-_]/g, ' ')
}

function parsePlaceholderTokens(content: string): PlaceholderToken[] {
  const tokens: PlaceholderToken[] = []
  const seenKeys = new Set<string>()

  for (const match of content.matchAll(PLACEHOLDER_REGEX)) {
    const type = match[1]
    const key = match[2]
    const fallbackRaw = match[3] || ''

    if (type !== 'text' && type !== 'image' && type !== 'latex') continue
    if (!key || seenKeys.has(`${type}:${key}`)) continue
    const placeholderType: PlaceholderType = type

    seenKeys.add(`${type}:${key}`)
    tokens.push({
      type: placeholderType,
      key,
      fallback: placeholderDefaults(placeholderType, key, fallbackRaw)
    })
  }

  return tokens
}

function createTextElement(token: PlaceholderToken, yMm: number, widthMm: number, isFirstText: boolean): TextElement {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    name: `Text ${token.key}`,
    xMm: 18,
    yMm,
    widthMm,
    heightMm: isFirstText ? 24 : 18,
    rotationDeg: 0,
    locked: false,
    text: token.fallback,
    variant: isFirstText ? 'title' : 'body',
    align: isFirstText ? 'center' : 'left',
    fontSize: isFirstText ? 34 : 17,
    fontFamily: '"PT Sans", sans-serif',
    color: '#2B2B2B',
    fontWeight: isFirstText ? 'bold' : 'normal',
    fontStyle: 'normal',
    backgroundColor: 'transparent'
  }
}

function createImageElement(token: PlaceholderToken, yMm: number, widthMm: number): ImageElement {
  return {
    id: crypto.randomUUID(),
    type: 'image',
    name: `Image ${token.key}`,
    xMm: 18,
    yMm,
    widthMm,
    heightMm: 72,
    rotationDeg: 0,
    locked: false,
    assetId: 'placeholder-import',
    src: `https://placehold.co/960x540/e9edf3/4b5465?text=${encodeURIComponent(token.fallback)}`,
    fit: 'cover'
  }
}

function createLatexElement(token: PlaceholderToken, yMm: number, widthMm: number): LatexElement {
  return {
    id: crypto.randomUUID(),
    type: 'latex',
    name: `Formula ${token.key}`,
    xMm: 18,
    yMm,
    widthMm,
    heightMm: 22,
    rotationDeg: 0,
    locked: false,
    latex: token.fallback
  }
}

function buildTemplateElements(tokens: PlaceholderToken[], format: PosterFormat): { pages: { elements: PosterElement[] }[]; warnings: string[] } {
  const warnings: string[] = []
  const size = FORMAT_DIMENSIONS[format]
  const contentWidth = Math.max(60, size.widthMm - 36)
  const pageBottom = size.heightMm - 18
  const pages: { elements: PosterElement[] }[] = [{ elements: [] }]

  let pageIndex = 0
  let yMm = 18
  let hasTitle = false

  const normalizedTokens: PlaceholderToken[] = tokens.length > 0
    ? tokens
    : [
        {
          type: 'text',
          key: 'content',
          fallback: 'Kein Platzhalter gefunden. Fuege z.B. {{text:title|Dein Titel}} hinzu.'
        }
      ]

  if (tokens.length === 0) {
    warnings.push('Keine Platzhalter erkannt. Es wurde ein editierbarer Standard-Textblock erstellt.')
  }

  for (const token of normalizedTokens) {
    const element =
      token.type === 'image'
        ? createImageElement(token, yMm, contentWidth)
        : token.type === 'latex'
          ? createLatexElement(token, yMm, contentWidth)
          : createTextElement(token, yMm, contentWidth, !hasTitle)

    if (token.type === 'text' && !hasTitle) {
      hasTitle = true
    }

    const neededHeight = element.heightMm + 8
    if (yMm + neededHeight > pageBottom) {
      pages.push({ elements: [] })
      pageIndex += 1
      yMm = 18
      element.yMm = yMm
    }

    pages[pageIndex]?.elements.push(element)
    yMm += neededHeight
  }

  return { pages, warnings }
}

function inferTemplateName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '').trim()
  return sanitizeTemplateName(baseName || 'Importierte Vorlage')
}

export function createTemplateFromSource(params: {
  fileName: string
  content: string
  brandKitId: BrandKitId
  engine?: TemplateSourceEngine
  templateId?: string
}): { item: HomeTemplateItem; warnings: string[] } {
  const engine = params.engine || detectTemplateEngine(params.fileName, params.content)
  const format = detectFormat(params.content)
  const placeholders = parsePlaceholderTokens(params.content)
  const { pages, warnings } = buildTemplateElements(placeholders, format)

  const template: Template = {
    id: params.templateId || `tpl_upload_${crypto.randomUUID()}`,
    name: inferTemplateName(params.fileName),
    format,
    allowedZones: [],
    pages,
    source: {
      type: engine,
      content: params.content,
      fileName: params.fileName,
      importedAt: new Date().toISOString()
    }
  }

  return {
    item: {
      template,
      previewLabel: engine === 'typst' ? 'Typst Import' : 'LaTeX Import',
      brandKitId: params.brandKitId
    },
    warnings
  }
}

export function getBuiltInSourceTemplateItems(): HomeTemplateItem[] {
  return BUILT_IN_SOURCE_TEMPLATE_PRESETS.map((preset) =>
    createTemplateFromSource({
      templateId: preset.id,
      fileName: `${preset.name}.${preset.engine === 'typst' ? 'typ' : 'tex'}`,
      content: preset.content,
      brandKitId: preset.brandKitId,
      engine: preset.engine
    }).item
  )
}
