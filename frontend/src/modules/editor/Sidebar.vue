<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useEditorStore } from '@/core/store/useEditorStore'
import type { TextElement, ImageElement } from '@/core/models/element'
import { Heading1, Image, Layers, Settings2, Type } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const editorStore = useEditorStore()

type PanelState = 'layers' | 'text' | 'image' | 'settings'

const activePanel = ref<PanelState>('layers')
const fileInput = ref<HTMLInputElement | null>(null)

const panelTitle = computed(() => {
  if (activePanel.value === 'layers') return 'Ebenen'
  if (activePanel.value === 'text') return 'Text'
  if (activePanel.value === 'image') return 'Bilder'
  return 'Einstellungen'
})

const layers = computed(() => {
  return [...editorStore.currentElements].reverse()
})

function addTitle() {
  const newTitle: TextElement = {
    id: crypto.randomUUID(),
    type: 'text',
    name: 'Title Layer',
    xMm: 20,
    yMm: 50,
    widthMm: 170,
    heightMm: 30,
    rotationDeg: 0,
    locked: false,
    text: 'Neuer Titel',
    variant: 'title',
    align: 'center',
    fontSize: 48,
    fontFamily: 'Arial',
    color: '#000000',
    fontWeight: 'bold',
    fontStyle: 'normal',
    backgroundColor: 'transparent'
  }
  editorStore.addElement(newTitle)
}

function addText() {
  const newText: TextElement = {
    id: crypto.randomUUID(),
    type: 'text',
    name: 'Text Layer',
    xMm: 20,
    yMm: 90,
    widthMm: 170,
    heightMm: 40,
    rotationDeg: 0,
    locked: false,
    text: 'Dies ist ein Textblock.\nHier koennen Sie Ihren Inhalt eingeben.\nMehrere Zeilen sind moeglich.',
    variant: 'body',
    align: 'left',
    fontSize: 17,
    fontFamily: '"PT Sans", sans-serif',
    color: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    backgroundColor: 'transparent'
  }
  editorStore.addElement(newText)
}

function triggerImageUpload() {
  fileInput.value?.click()
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      const src = e.target?.result as string
      const newImage: ImageElement = {
        id: crypto.randomUUID(),
        type: 'image',
        name: 'Image Layer',
        xMm: 20,
        yMm: 20,
        widthMm: 170,
        heightMm: 60,
        rotationDeg: 0,
        locked: false,
        assetId: 'upload',
        src,
        fit: 'cover'
      }

      editorStore.addElement(newImage)
      activePanel.value = 'layers'
    }

    reader.readAsDataURL(file)
    target.value = ''
  }
}

function selectLayer(id: string) {
  editorStore.selectElement(id)
}

function layerTypeLabel(type: string) {
  return type === 'image' ? 'Bild' : 'Text'
}
</script>

<template>
  <aside class="editor-left">
    <nav class="editor-toolrail d-flex flex-column align-items-center gap-2 py-3 px-2">
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm editor-rail-button"
        :class="{ active: activePanel === 'layers' }"
        title="Ebenen"
        @click="activePanel = 'layers'"
      >
        <Layers :size="16" />
      </button>

      <button
        type="button"
        class="btn btn-outline-secondary btn-sm editor-rail-button"
        :class="{ active: activePanel === 'text' }"
        title="Text"
        @click="activePanel = 'text'"
      >
        <Type :size="16" />
      </button>

      <button
        type="button"
        class="btn btn-outline-secondary btn-sm editor-rail-button"
        :class="{ active: activePanel === 'image' }"
        title="Bilder"
        @click="activePanel = 'image'"
      >
        <Image :size="16" />
      </button>

      <button
        type="button"
        class="btn btn-outline-secondary btn-sm editor-rail-button"
        :class="{ active: activePanel === 'settings' }"
        title="Einstellungen"
        @click="activePanel = 'settings'"
      >
        <Settings2 :size="16" />
      </button>
    </nav>

    <section class="editor-context d-flex flex-column flex-grow-1">
      <header class="border-bottom p-3">
        <h2 class="h6 mb-0">{{ panelTitle }}</h2>
      </header>

      <div class="editor-scroll p-3">
        <div v-if="activePanel === 'layers'" class="vstack gap-2">
          <button
            v-for="element in layers"
            :key="element.id"
            type="button"
            class="list-group-item list-group-item-action rounded border"
            :class="{ active: editorStore.selectedElementId === element.id }"
            @click="selectLayer(element.id)"
          >
            <div class="d-flex justify-content-between align-items-center">
              <span class="small fw-semibold">{{ element.name }}</span>
              <span class="badge text-bg-light">{{ layerTypeLabel(element.type) }}</span>
            </div>
          </button>

          <p v-if="layers.length === 0" class="small text-secondary mb-0">
            Keine Elemente vorhanden.
          </p>
        </div>

        <div v-else-if="activePanel === 'text'" class="vstack gap-2">
          <button type="button" class="btn btn-outline-secondary text-start" @click="addTitle">
            <span class="d-flex align-items-center gap-2">
              <Heading1 :size="16" />
              Titel einfuegen
            </span>
          </button>
          <button type="button" class="btn btn-outline-secondary text-start" @click="addText">
            <span class="d-flex align-items-center gap-2">
              <Type :size="16" />
              Textblock einfuegen
            </span>
          </button>
        </div>

        <div v-else-if="activePanel === 'image'" class="vstack gap-2">
          <button type="button" class="btn btn-outline-secondary text-start" @click="triggerImageUpload">
            <span class="d-flex align-items-center gap-2">
              <Image :size="16" />
              Bild hochladen
            </span>
          </button>
          <p class="small text-secondary mb-0">Neue Bilder werden als eigene Ebene hinzugefuegt.</p>
        </div>

        <div v-else class="vstack gap-2">
          <div class="border rounded p-2 bg-light">
            <div class="small text-secondary">Format</div>
            <div class="fw-semibold">{{ editorStore.activePoster?.format || '-' }}</div>
          </div>
          <div class="border rounded p-2 bg-light">
            <div class="small text-secondary">Dokument</div>
            <div class="fw-semibold">
              {{ editorStore.activePoster?.widthMm || 0 }} x {{ editorStore.activePoster?.heightMm || 0 }} mm
            </div>
          </div>
        </div>
      </div>

      <footer class="border-top p-3 vstack gap-2">
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="router.push('/templates')">
          Zur Vorlagenauswahl
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="authStore.logout(); router.push('/login')"
        >
          Logout
        </button>
      </footer>
    </section>

    <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleImageUpload" />
  </aside>
</template>
