<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/core/store/useEditorStore'
import type { TextElement, ImageElement } from '@/core/models/element'
import { GripVertical, Heading1, Image, Layers, Settings2, Trash2, Type } from 'lucide-vue-next'

const editorStore = useEditorStore()

type PanelState = 'layers' | 'text' | 'image' | 'settings'

const activePanel = ref<PanelState>('layers')
const fileInput = ref<HTMLInputElement | null>(null)
const draggedLayerId = ref<string | null>(null)
const dragOverLayerId = ref<string | null>(null)

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

function deleteLayer(id: string) {
  editorStore.deleteElement(id)
}

function onLayerDragStart(layerId: string, event: DragEvent) {
  draggedLayerId.value = layerId
  dragOverLayerId.value = null
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', layerId)
  }
}

function onLayerDragOver(layerId: string, event: DragEvent) {
  if (!draggedLayerId.value || draggedLayerId.value === layerId) return
  event.preventDefault()
  dragOverLayerId.value = layerId
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onLayerDrop(targetLayerId: string, event: DragEvent) {
  event.preventDefault()
  const sourceLayerId = draggedLayerId.value || event.dataTransfer?.getData('text/plain') || null
  if (!sourceLayerId || sourceLayerId === targetLayerId) {
    draggedLayerId.value = null
    dragOverLayerId.value = null
    return
  }

  const displayOrder = [...layers.value]
  const sourceIndex = displayOrder.findIndex((item) => item.id === sourceLayerId)
  const targetIndex = displayOrder.findIndex((item) => item.id === targetLayerId)
  if (sourceIndex === -1 || targetIndex === -1) {
    draggedLayerId.value = null
    dragOverLayerId.value = null
    return
  }

  const [source] = displayOrder.splice(sourceIndex, 1)
  if (!source) {
    draggedLayerId.value = null
    dragOverLayerId.value = null
    return
  }
  displayOrder.splice(targetIndex, 0, source)

  const editorOrderIds = [...displayOrder].reverse().map((item) => item.id)
  editorStore.reorderElementsByIds(editorOrderIds)

  draggedLayerId.value = null
  dragOverLayerId.value = null
}

function onLayerDragEnd() {
  draggedLayerId.value = null
  dragOverLayerId.value = null
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
          <div
            v-for="element in layers"
            :key="element.id"
            class="sidebar-layer-item d-flex align-items-center gap-2"
            :class="{
              'is-drag-over': dragOverLayerId === element.id && draggedLayerId !== element.id
            }"
            draggable="true"
            @dragstart="onLayerDragStart(element.id, $event)"
            @dragover="onLayerDragOver(element.id, $event)"
            @drop="onLayerDrop(element.id, $event)"
            @dragend="onLayerDragEnd"
          >
            <span class="sidebar-layer-handle" aria-hidden="true">
              <GripVertical :size="14" />
            </span>

            <button
              type="button"
              class="list-group-item list-group-item-action rounded border d-flex justify-content-between align-items-center flex-grow-1 sidebar-layer-main"
              :class="{ active: editorStore.selectedElementId === element.id }"
              @click="selectLayer(element.id)"
            >
              <span class="small fw-semibold text-truncate">{{ element.name }}</span>
              <span class="badge text-bg-light">{{ layerTypeLabel(element.type) }}</span>
            </button>

            <button
              type="button"
              class="btn btn-outline-danger btn-sm sidebar-layer-delete"
              title="Element loeschen"
              @click.stop="deleteLayer(element.id)"
            >
              <Trash2 :size="14" />
            </button>
          </div>

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

    </section>

    <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleImageUpload" />
  </aside>
</template>

<style scoped>
.sidebar-layer-item {
  min-width: 0;
}

.sidebar-layer-main {
  min-height: 2.8rem;
  padding: 0.55rem 0.7rem;
}

.sidebar-layer-delete {
  width: 2.2rem;
  height: 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-layer-handle {
  color: var(--color-gray-500);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.sidebar-layer-item:active .sidebar-layer-handle {
  cursor: grabbing;
}

.sidebar-layer-item.is-drag-over {
  outline: 2px solid var(--color-brand-indigo);
  outline-offset: 2px;
}
</style>
