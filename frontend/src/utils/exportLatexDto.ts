import type { ImageElement, LatexElement, PosterElement, TextElement } from '@/core/models/element'
import type { Poster } from '@/core/models/poster'

interface LatexExportImageAsset {
  elementId: string
  fileName: string
  blob: Blob
}

interface PosterLatexBundle {
  document: string
  imageAssets: LatexExportImageAsset[]
}

function sanitizeFilename(value: string, fallback: string) {
  const normalized = value.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '')
  return normalized || fallback
}

function escapeLatexText(value: string) {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([{}$&#_^%])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
}

function normalizeHexColor(color: string | undefined, fallback = '000000') {
  if (!color) return fallback
  const candidate = color.trim()
  if (candidate.toLowerCase() === 'transparent') return 'transparent'
  const shortHex = candidate.match(/^#([a-fA-F0-9]{3})$/)
  if (shortHex) {
    const [, short] = shortHex
    if (!short) return fallback
    return short
      .split('')
      .map((token) => `${token}${token}`)
      .join('')
      .toUpperCase()
  }
  const fullHex = candidate.match(/^#([a-fA-F0-9]{6})$/)
  if (!fullHex) return fallback
  const [, full] = fullHex
  if (!full) return fallback
  return full.toUpperCase()
}

function toMm(value: number) {
  const safe = Number.isFinite(value) ? value : 0
  return safe.toFixed(2)
}

function toPt(fontSize: number) {
  const safe = Number.isFinite(fontSize) ? Math.max(8, fontSize) : 12
  return (safe * 0.75).toFixed(1)
}

function extractPrimaryFontFamily(fontFamily: string | undefined) {
  if (!fontFamily) return 'TeX Gyre Heros'
  const first = fontFamily.split(',')[0]?.trim() || 'TeX Gyre Heros'
  return first.replace(/^['"]+|['"]+$/g, '') || 'TeX Gyre Heros'
}

function renderTextPayload(element: TextElement) {
  const text = escapeLatexText(element.text).replace(/\n/g, ' \\\\ ')
  const align = element.align === 'center' ? '\\centering' : element.align === 'right' ? '\\raggedleft' : '\\raggedright'
  const fontColor = normalizeHexColor(element.color, '1F2937')
  const lineHeightPt = toPt(element.fontSize * 1.25)
  const fontFamily = extractPrimaryFontFamily(element.fontFamily)

  const fontFlags = []
  if (element.fontWeight === 'bold') fontFlags.push('\\bfseries')
  if (element.fontStyle === 'italic') fontFlags.push('\\itshape')

  return [
    `\\PosterSetFont{${escapeLatexText(fontFamily)}}`,
    `\\fontsize{${toPt(element.fontSize)}pt}{${lineHeightPt}pt}\\selectfont`,
    `\\color[HTML]{${fontColor}}`,
    fontFlags.join(' '),
    align,
    text
  ]
    .filter((entry) => entry.length > 0)
    .join('\n')
}

function latexTextBlock(element: TextElement) {
  const payload = renderTextPayload(element)
  const background = normalizeHexColor(element.backgroundColor)

  const body =
    background === 'transparent'
      ? `\\parbox[t][${toMm(element.heightMm)}mm][t]{${toMm(element.widthMm)}mm}{\n${payload}\n}`
      : [
          '\\setlength{\\fboxsep}{0mm}',
          `\\colorbox[HTML]{${background}}{\\parbox[t][${toMm(element.heightMm)}mm][t]{${toMm(element.widthMm)}mm}{`,
          payload,
          '}}'
        ].join('\n')

  return [
    `\\begin{textblock*}{${toMm(element.widthMm)}mm}(${toMm(element.xMm)}mm,${toMm(element.yMm)}mm)`,
    body,
    '\\end{textblock*}'
  ].join('\n')
}

function latexImageBlock(element: ImageElement, imageByElementId: Map<string, LatexExportImageAsset>) {
  const imageAsset = imageByElementId.get(element.id)
  if (!imageAsset) {
    return [
      `\\begin{textblock*}{${toMm(element.widthMm)}mm}(${toMm(element.xMm)}mm,${toMm(element.yMm)}mm)`,
      `\\fbox{\\parbox[c][${toMm(element.heightMm)}mm][c]{${toMm(element.widthMm)}mm}{\\centering Bild nicht gefunden: ${escapeLatexText(element.name)}}}`,
      '\\end{textblock*}'
    ].join('\n')
  }

  return [
    `\\begin{textblock*}{${toMm(element.widthMm)}mm}(${toMm(element.xMm)}mm,${toMm(element.yMm)}mm)`,
    `\\includegraphics[width=${toMm(element.widthMm)}mm,height=${toMm(element.heightMm)}mm,keepaspectratio]{${escapeLatexText(imageAsset.fileName)}}`,
    '\\end{textblock*}'
  ].join('\n')
}

function latexFormulaBlock(element: LatexElement) {
  return [
    `\\begin{textblock*}{${toMm(element.widthMm)}mm}(${toMm(element.xMm)}mm,${toMm(element.yMm)}mm)`,
    `\\parbox[t][${toMm(element.heightMm)}mm][c]{${toMm(element.widthMm)}mm}{`,
    `\\[${element.latex}\\]`,
    '}',
    '\\end{textblock*}'
  ].join('\n')
}

function fileExtensionFromMime(mimeType: string) {
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('gif')) return 'gif'
  return 'png'
}

function decodeDataUrl(dataUrl: string): { mimeType: string; blob: Blob } | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null
  const mimeType = match[1] || 'image/png'
  const base64 = match[2]
  if (!base64) return null

  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return {
      mimeType,
      blob: new Blob([bytes], { type: mimeType })
    }
  } catch {
    return null
  }
}

async function fetchImageBlob(src: string): Promise<{ mimeType: string; blob: Blob } | null> {
  try {
    const response = await fetch(src)
    if (!response.ok) return null
    const blob = await response.blob()
    const mimeType = blob.type || 'image/png'
    return { mimeType, blob }
  } catch {
    return null
  }
}

async function collectLatexImageAssets(poster: Poster): Promise<LatexExportImageAsset[]> {
  const assets: LatexExportImageAsset[] = []
  let imageIndex = 1

  for (const page of poster.pages) {
    for (const element of page.elements) {
      if (element.type !== 'image') continue
      const src = element.src || ''
      if (!src) continue

      const decoded = src.startsWith('data:image/') ? decodeDataUrl(src) : await fetchImageBlob(src)
      if (!decoded) continue

      const extension = fileExtensionFromMime(decoded.mimeType)
      const fileName = `${sanitizeFilename(element.name || `image_${imageIndex}`, `image_${imageIndex}`)}_${imageIndex}.${extension}`
      assets.push({
        elementId: element.id,
        fileName,
        blob: decoded.blob
      })
      imageIndex += 1
    }
  }

  return assets
}

function renderLatexElement(element: PosterElement, imageByElementId: Map<string, LatexExportImageAsset>) {
  if (element.type === 'text') return latexTextBlock(element)
  if (element.type === 'image') return latexImageBlock(element, imageByElementId)
  return latexFormulaBlock(element)
}

async function buildLatexBundle(poster: Poster): Promise<PosterLatexBundle> {
  const imageAssets = await collectLatexImageAssets(poster)
  const imageByElementId = new Map(imageAssets.map((asset) => [asset.elementId, asset]))
  const title = escapeLatexText(poster.meta.title || 'Poster Export')
  const pageBackground = normalizeHexColor(poster.backgroundColor, 'FFFFFF')

  const body = poster.pages
    .map((page, index) => {
      const elements = page.elements.map((element) => renderLatexElement(element, imageByElementId)).join('\n\n')
      const pageBreak = index < poster.pages.length - 1 ? '\n\\newpage\n' : ''
      return `${elements}${pageBreak}`
    })
    .join('\n')

  const document = [
    '% !TEX program = pdflatex',
    '% Generated by Poster Designer',
    '\\documentclass{article}',
    '\\usepackage{iftex}',
    '\\ifPDFTeX',
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage[T1]{fontenc}',
    '\\usepackage{helvet}',
    '\\renewcommand{\\familydefault}{\\sfdefault}',
    '\\newcommand{\\PosterSetFont}[1]{\\fontfamily{phv}\\selectfont}',
    '\\else',
    '\\usepackage{fontspec}',
    '\\newcommand{\\PosterSetFont}[1]{\\IfFontExistsTF{#1}{\\fontspec{#1}}{\\fontspec{TeX Gyre Heros}}}',
    '\\fi',
    '\\usepackage{xcolor}',
    '\\usepackage[absolute,overlay]{textpos}',
    '\\usepackage{graphicx}',
    '\\usepackage[margin=0mm,paperwidth=' + toMm(poster.widthMm) + 'mm,paperheight=' + toMm(poster.heightMm) + 'mm]{geometry}',
    '\\pagestyle{empty}',
    `\\definecolor{PosterBg}{HTML}{${pageBackground}}`,
    `\\title{${title}}`,
    '\\begin{document}',
    '\\TPGrid{1mm}{1mm}',
    '\\pagecolor{PosterBg}',
    body,
    '\\end{document}'
  ].join('\n')

  return { document, imageAssets }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 0)
}

export async function downloadPosterAsLatex(poster: Poster) {
  const bundle = await buildLatexBundle(poster)
  const texFileName = `${sanitizeFilename(poster.meta.title || 'poster', 'poster')}.tex`

  downloadBlob(new Blob([bundle.document], { type: 'application/x-tex;charset=utf-8' }), texFileName)

  bundle.imageAssets.forEach((asset, index) => {
    window.setTimeout(() => {
      downloadBlob(asset.blob, asset.fileName)
    }, 80 * (index + 1))
  })
}

export function posterToTypstDocument(poster: Poster) {
  const body = poster.pages
    .map((page, index) => {
      const pageBody = page.elements
        .map((element) => {
          if (element.type === 'text') {
            return [
              `#place(left + ${toMm(element.xMm)}mm, top + ${toMm(element.yMm)}mm, [`,
              `  #box(width: ${toMm(element.widthMm)}mm, height: ${toMm(element.heightMm)}mm, inset: 2pt)[`,
              `    #set text(size: ${Math.max(8, Math.round(element.fontSize))}pt, fill: rgb("#${normalizeHexColor(element.color, '000000')}"))`,
              `    ${JSON.stringify(element.text)}`,
              '  ]',
              '])'
            ].join('\n')
          }

          if (element.type === 'image') {
            return [
              `#place(left + ${toMm(element.xMm)}mm, top + ${toMm(element.yMm)}mm, [`,
              `  #rect(width: ${toMm(element.widthMm)}mm, height: ${toMm(element.heightMm)}mm, stroke: 1pt + gray)[${JSON.stringify(`Bild: ${element.name}`)}]`,
              '])'
            ].join('\n')
          }

          return [
            `#place(left + ${toMm(element.xMm)}mm, top + ${toMm(element.yMm)}mm, [`,
            `  $${element.latex}$`,
            '])'
          ].join('\n')
        })
        .join('\n\n')

      if (index === 0) return pageBody
      return `#pagebreak()\n${pageBody}`
    })
    .join('\n\n')

  return [
    '// Generated by Poster Designer',
    `#set page(width: ${toMm(poster.widthMm)}mm, height: ${toMm(poster.heightMm)}mm, margin: 0mm, fill: rgb("#${normalizeHexColor(poster.backgroundColor, 'FFFFFF')}"))`,
    '#set text(font: "PT Sans")',
    body
  ].join('\n')
}

export function downloadPosterAsTypst(poster: Poster) {
  const content = posterToTypstDocument(poster)
  const fileName = `${sanitizeFilename(poster.meta.title || 'poster', 'poster')}.typ`
  downloadBlob(new Blob([content], { type: 'text/plain;charset=utf-8' }), fileName)
}
