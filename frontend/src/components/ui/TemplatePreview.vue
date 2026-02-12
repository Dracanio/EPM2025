<script setup lang="ts">
import { computed } from 'vue'
import type { ImageElement, LatexElement, PosterElement, TextElement } from '@/core/models/element'
import type { Template } from '@/core/models/template'

const props = defineProps<{
  template?: Template
}>()

const pageElements = computed(() => props.template?.pages[0]?.elements ?? [])
const pageSize = computed(() => getFormatSize(props.template?.format))

function getElementStyle(element: PosterElement) {
  const { widthMm, heightMm } = pageSize.value
  const style: Record<string, string> = {
    left: `${(element.xMm / widthMm) * 100}%`,
    top: `${(element.yMm / heightMm) * 100}%`,
    width: `${(element.widthMm / widthMm) * 100}%`,
    height: `${(element.heightMm / heightMm) * 100}%`,
    transform: `rotate(${element.rotationDeg}deg)`
  }

  if (element.type === 'text') {
    const textElement = element as TextElement
    style.fontSize = `${Math.max(9, Math.round(textElement.fontSize * 0.35))}px`
    style.fontWeight = textElement.fontWeight
    style.color = textElement.color || '#1f2937'
    style.fontFamily = textElement.fontFamily || '"PT Sans", sans-serif'
    style.textAlign = textElement.align
    style.backgroundColor = textElement.backgroundColor === 'transparent' ? 'transparent' : textElement.backgroundColor
    style.padding = '0.06rem 0.15rem'
    style.lineHeight = '1.2'
    style.whiteSpace = 'pre-line'
    style.overflow = 'hidden'
  }

  return style
}

function getFormatSize(format: string | undefined) {
  if (format === 'Flyer') return { widthMm: 100, heightMm: 210 }
  if (format === 'A3') return { widthMm: 297, heightMm: 420 }
  if (format === 'A2') return { widthMm: 420, heightMm: 594 }
  if (format === 'A4 Landscape') return { widthMm: 297, heightMm: 210 }
  return { widthMm: 210, heightMm: 297 }
}
</script>

<template>
  <div class="template-preview-surface">
    <div v-if="props.template" class="template-preview-page">
      <template v-for="element in pageElements" :key="element.id">
        <img
          v-if="element.type === 'image'"
          class="template-preview-element"
          :style="getElementStyle(element)"
          :src="(element as ImageElement).src || 'https://placehold.co/800x420/ced4da/6c757d?text=Bild'"
          alt=""
          draggable="false"
          :data-kind="element.type"
        />
        <div
          v-else-if="element.type === 'text'"
          class="template-preview-element template-preview-text"
          :style="getElementStyle(element)"
          :data-kind="element.type"
        >
          {{ (element as TextElement).text }}
        </div>
        <div
          v-else
          class="template-preview-element template-preview-text template-preview-latex"
          :style="getElementStyle(element)"
          :data-kind="element.type"
        >
          ${{ (element as LatexElement).latex }}$
        </div>
      </template>
    </div>

    <div v-else class="template-preview-fallback" />
  </div>
</template>

<style scoped>
.template-preview-surface {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
  background: #d3d7de;
}

.template-preview-page {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.template-preview-element {
  position: absolute;
  display: block;
  border: 0;
}

.template-preview-text {
  text-overflow: ellipsis;
}

.template-preview-latex {
  font-family: Monaco, Menlo, Consolas, monospace;
}

.template-preview-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #d5dae2 0%, #c9cfd9 100%);
}
</style>
