<template>
  <div class="d-flex flex-column h-100">
    <div class="p-3 border-bottom bg-light d-flex align-items-center justify-content-between">
      <h2 class="h6 mb-0 text-uppercase text-secondary">{{ title }}</h2>
      <button
        v-if="selectedElement"
        type="button"
        class="btn btn-link btn-sm text-decoration-none p-0"
        @click="store.selectElement(null)"
      >
        <span class="d-inline-flex align-items-center gap-1">
          <X :size="14" />
          Schliessen
        </span>
      </button>
    </div>

    <div class="editor-scroll p-3">
      <TextInspector v-if="selectedElement?.type === 'text'" :element="selectedElement as TextElement" />
      <ImageInspector v-if="selectedElement?.type === 'image'" :element="selectedElement as ImageElement" />

      <div v-if="!selectedElement" class="vstack gap-4">
        <div class="text-center text-secondary small fst-italic py-3">
          <MousePointerClick :size="28" class="mb-2" />
          <div>Kein Element ausgewaehlt.</div>
          <div>Klicke auf ein Element auf dem Poster.</div>
        </div>

        <div>
          <label class="inspector-label">Poster Hintergrund</label>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="color in availableColors"
              :key="color.value"
              type="button"
              class="color-swatch"
              :style="{ backgroundColor: color.value }"
              :title="color.name"
              @click="setPosterBackground(color.value)"
            ></button>
            <input
              type="color"
              :value="store.activePoster?.backgroundColor || '#ffffff'"
              class="color-swatch"
              @input="(e) => setPosterBackground((e.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <div v-if="selectedElement" class="mt-4 pt-3 border-top">
        <label class="inspector-label">Ausrichtung (Seite)</label>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm flex-fill"
            title="Horizontal zentrieren"
            @click="store.alignElement(selectedElement.id, 'h-center')"
          >
            <AlignHorizontalJustifyCenter :size="16" />
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm flex-fill"
            title="Vertikal zentrieren"
            @click="store.alignElement(selectedElement.id, 'v-center')"
          >
            <AlignVerticalJustifyCenter :size="16" />
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm flex-fill"
            title="Mitte"
            @click="store.alignElement(selectedElement.id, 'center')"
          >
            <Crosshair :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedElement" class="p-3 border-top bg-light d-flex justify-content-between align-items-center">
      <span class="small text-secondary text-uppercase fw-semibold d-inline-flex align-items-center gap-2">
        <Layers :size="14" />
        Ebene
      </span>

      <div class="d-flex align-items-center gap-2">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          title="Nach hinten"
          @click="store.moveElementDown(selectedElement.id)"
        >
          <ArrowDown :size="16" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          title="Nach vorne"
          @click="store.moveElementUp(selectedElement.id)"
        >
          <ArrowUp :size="16" />
        </button>
        <div class="panel-divider"></div>
        <button
          type="button"
          class="btn btn-outline-danger btn-sm"
          title="Loeschen"
          @click="store.deleteElement(selectedElement.id)"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/core/store/useEditorStore'
import TextInspector from './TextInspector.vue'
import ImageInspector from './ImageInspector.vue'
import type { TextElement, ImageElement } from '@/core/models/element'
import { colors } from '@/core/styleguide/colors'
import {
  X,
  MousePointerClick,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Crosshair,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-vue-next'

const store = useEditorStore()
const selectedElement = computed(() => store.selectedElement)

const availableColors = [
  { name: 'White', value: colors.palette.white },
  { name: 'Light Gray', value: colors.palette.lightGray },
  { name: 'Medium Gray', value: colors.palette.mediumGray },
  { name: 'Dark Gray', value: colors.palette.darkGray },
  { name: 'TH Red', value: colors.palette.thRed },
  { name: 'Purple', value: colors.palette.purple },
  { name: 'Blue', value: colors.palette.blue },
  { name: 'Green', value: colors.palette.green }
]

function setPosterBackground(color: string) {
  store.updatePoster({ backgroundColor: color })
}

const title = computed(() => {
  if (!selectedElement.value) return 'Eigenschaften'
  if (selectedElement.value.type === 'text') return 'Text bearbeiten'
  if (selectedElement.value.type === 'image') return 'Bild bearbeiten'
  if (selectedElement.value.type === 'latex') return 'LaTeX Formel'
  return 'Eigenschaften'
})
</script>
