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
      <LatexInspector v-if="selectedElement?.type === 'latex'" :element="selectedElement as LatexElement" />

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
              :disabled="!canEditColors"
              @click="setPosterBackground(color.value)"
            ></button>
            <input
              type="color"
              :value="store.activePoster?.backgroundColor || '#ffffff'"
              class="color-swatch"
              :disabled="!canEditColors"
              @input="(e) => setPosterBackground((e.target as HTMLInputElement).value)"
            />
          </div>
          <p v-if="!canEditColors" class="small text-secondary mt-2 mb-0 d-inline-flex align-items-center gap-1">
            <Lock :size="12" />
            Farben sind fuer deine Rolle gesperrt.
          </p>
        </div>
      </div>

      <div v-if="selectedElement" class="mt-4 pt-3 border-top">
        <label class="inspector-label">Ausrichtung (Seite)</label>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm flex-fill"
            title="Horizontal zentrieren"
            :disabled="!canMoveAndResizeElements"
            @click="store.alignElement(selectedElement.id, 'h-center')"
          >
            <AlignHorizontalJustifyCenter :size="16" />
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm flex-fill"
            title="Vertikal zentrieren"
            :disabled="!canMoveAndResizeElements"
            @click="store.alignElement(selectedElement.id, 'v-center')"
          >
            <AlignVerticalJustifyCenter :size="16" />
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm flex-fill"
            title="Mitte"
            :disabled="!canMoveAndResizeElements"
            @click="store.alignElement(selectedElement.id, 'center')"
          >
            <Crosshair :size="16" />
          </button>
        </div>
        <p v-if="!canMoveAndResizeElements" class="small text-secondary mt-2 mb-0 d-inline-flex align-items-center gap-1">
          <Lock :size="12" />
          Position und Groesse sind fuer deine Rolle gesperrt.
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/core/store/useEditorStore'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'
import TextInspector from './TextInspector.vue'
import ImageInspector from './ImageInspector.vue'
import LatexInspector from './LatexInspector.vue'
import type { TextElement, ImageElement, LatexElement } from '@/core/models/element'
import type { ProjectRole } from '@/core/models/accessControl'
import { colors } from '@/core/styleguide/colors'
import {
  X,
  MousePointerClick,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Crosshair,
  Lock
} from 'lucide-vue-next'

const store = useEditorStore()
const authStore = useAuthStore()
const accessStore = useProjectAccessStore()
const selectedElement = computed(() => store.selectedElement)

const activeProjectId = computed(() => store.activePoster?.id || '')
const currentProjectRole = computed<ProjectRole>(() => {
  if (authStore.isLinkSession) return authStore.linkSession?.role || 'viewer'
  const resolved = accessStore.resolveProjectRole(activeProjectId.value, authStore.user?.id, authStore.user?.email)
  return resolved || 'owner'
})

const canEditColors = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'editColors')
})

const canMoveAndResizeElements = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'moveAndResizeElements')
})

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
  if (!canEditColors.value) return
  store.updatePoster({ backgroundColor: color })
}

const title = computed(() => {
  if (!selectedElement.value) return 'Eigenschaften'
  if (selectedElement.value.type === 'text') return 'Text bearbeiten'
  if (selectedElement.value.type === 'image') return 'Bild bearbeiten'
  if (selectedElement.value.type === 'latex') return 'Formel bearbeiten'
  return 'Eigenschaften'
})
</script>
