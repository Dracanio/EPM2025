<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEditorStore } from '@/core/store/useEditorStore'
import type { TextElement, ImageElement, LatexElement } from '@/core/models/element'
import type { ProjectRole } from '@/core/models/accessControl'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'
import { GripVertical, Heading1, Image, Layers, Lock, Settings2, Trash2, Type, Users } from 'lucide-vue-next'
import ProjectSettingsPanel from './settings/ProjectSettingsPanel.vue'
import TeamManagementPanel from './settings/TeamManagementPanel.vue'

const editorStore = useEditorStore()
const authStore = useAuthStore()
const accessStore = useProjectAccessStore()

type PanelState = 'layers' | 'text' | 'image' | 'settings' | 'team'

const activePanel = ref<PanelState>('layers')
const fileInput = ref<HTMLInputElement | null>(null)
const draggedLayerId = ref<string | null>(null)
const dragOverLayerId = ref<string | null>(null)

const panelTitle = computed(() => {
  if (activePanel.value === 'layers') return 'Ebenen'
  if (activePanel.value === 'text') return 'Text'
  if (activePanel.value === 'image') return 'Bilder'
  if (activePanel.value === 'team') return 'Team & Zugriff'
  return 'Berechtigungen & Freigabe'
})

const layers = computed(() => {
  return [...editorStore.currentElements].reverse()
})

const activeProjectId = computed(() => editorStore.activePoster?.id || '')
const currentProjectRole = computed<ProjectRole>(() => {
  if (authStore.isLinkSession) return authStore.linkSession?.role || 'viewer'
  const resolved = accessStore.resolveProjectRole(activeProjectId.value, authStore.user?.id, authStore.user?.email)
  return resolved || 'owner'
})

const canAddElements = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'addNewElements')
})

const canUploadAssets = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'uploadOwnAssets')
})

const canDeleteElements = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'deleteElements')
})

const canMoveAndResizeElements = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'moveAndResizeElements')
})

const canManageProjectAccess = computed(() => {
  if (authStore.isLinkSession) return false
  if (!activeProjectId.value) return true
  return currentProjectRole.value === 'owner'
})

watch(
  canManageProjectAccess,
  (enabled) => {
    if (enabled) return
    if (activePanel.value === 'settings' || activePanel.value === 'team') {
      activePanel.value = 'layers'
    }
  },
  { immediate: true }
)

function addTitle() {
  if (!canAddElements.value) return
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
  if (!canAddElements.value) return
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

function addLatexFormula() {
  if (!canAddElements.value) return
  const formula: LatexElement = {
    id: crypto.randomUUID(),
    type: 'latex',
    name: 'Formula Layer',
    xMm: 20,
    yMm: 140,
    widthMm: 170,
    heightMm: 22,
    rotationDeg: 0,
    locked: false,
    latex: String.raw`\\int_0^1 x^2\\,dx = \\frac{1}{3}`
  }
  editorStore.addElement(formula)
}

function triggerImageUpload() {
  if (!canUploadAssets.value) return
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
  if (type === 'image') return 'Bild'
  if (type === 'latex') return 'Formel'
  return 'Text'
}

function deleteLayer(id: string) {
  if (!canDeleteElements.value) return
  editorStore.deleteElement(id)
}

function onLayerDragStart(layerId: string, event: DragEvent) {
  if (!canMoveAndResizeElements.value) return
  draggedLayerId.value = layerId
  dragOverLayerId.value = null
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', layerId)
  }
}

function onLayerDragOver(layerId: string, event: DragEvent) {
  if (!canMoveAndResizeElements.value) return
  if (!draggedLayerId.value || draggedLayerId.value === layerId) return
  event.preventDefault()
  dragOverLayerId.value = layerId
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onLayerDrop(targetLayerId: string, event: DragEvent) {
  if (!canMoveAndResizeElements.value) return
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
        v-if="canManageProjectAccess"
        type="button"
        class="btn btn-outline-secondary btn-sm editor-rail-button"
        :class="{ active: activePanel === 'settings' }"
        title="Berechtigungen & Freigabe"
        @click="activePanel = 'settings'"
      >
        <Settings2 :size="16" />
      </button>

      <button
        v-if="canManageProjectAccess"
        type="button"
        class="btn btn-outline-secondary btn-sm editor-rail-button"
        :class="{ active: activePanel === 'team' }"
        title="Team & Zugriff"
        @click="activePanel = 'team'"
      >
        <Users :size="16" />
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
            :draggable="canMoveAndResizeElements"
            @dragstart="onLayerDragStart(element.id, $event)"
            @dragover="onLayerDragOver(element.id, $event)"
            @drop="onLayerDrop(element.id, $event)"
            @dragend="onLayerDragEnd"
          >
            <span class="sidebar-layer-handle" aria-hidden="true">
              <GripVertical v-if="canMoveAndResizeElements" :size="14" />
              <Lock v-else :size="13" />
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
              :disabled="!canDeleteElements"
              @click.stop="deleteLayer(element.id)"
            >
              <Trash2 v-if="canDeleteElements" :size="14" />
              <Lock v-else :size="13" />
            </button>
          </div>

          <p v-if="layers.length === 0" class="small text-secondary mb-0">
            Keine Elemente vorhanden.
          </p>
          <p v-if="!canMoveAndResizeElements" class="small text-secondary mb-0 d-flex align-items-center gap-1">
            <Lock :size="12" />
            Ebenen-Reihenfolge ist fuer deine Rolle gesperrt.
          </p>
        </div>

        <div v-else-if="activePanel === 'text'" class="vstack gap-2">
          <button type="button" class="btn btn-outline-secondary text-start" :disabled="!canAddElements" @click="addTitle">
            <span class="d-flex align-items-center gap-2">
              <Heading1 v-if="canAddElements" :size="16" />
              <Lock v-else :size="14" />
              Titel einfuegen
            </span>
          </button>
          <button type="button" class="btn btn-outline-secondary text-start" :disabled="!canAddElements" @click="addText">
            <span class="d-flex align-items-center gap-2">
              <Type v-if="canAddElements" :size="16" />
              <Lock v-else :size="14" />
              Textblock einfuegen
            </span>
          </button>
          <button type="button" class="btn btn-outline-secondary text-start" :disabled="!canAddElements" @click="addLatexFormula">
            <span class="d-flex align-items-center gap-2">
              <Type v-if="canAddElements" :size="16" />
              <Lock v-else :size="14" />
              Formel einfuegen
            </span>
          </button>
          <p v-if="!canAddElements" class="small text-secondary mb-0">Deine Rolle erlaubt kein Hinzufuegen neuer Elemente.</p>
        </div>

        <div v-else-if="activePanel === 'image'" class="vstack gap-2">
          <button type="button" class="btn btn-outline-secondary text-start" :disabled="!canUploadAssets" @click="triggerImageUpload">
            <span class="d-flex align-items-center gap-2">
              <Image v-if="canUploadAssets" :size="16" />
              <Lock v-else :size="14" />
              Bild hochladen
            </span>
          </button>
          <p class="small text-secondary mb-0">
            {{ canUploadAssets ? 'Neue Bilder werden als eigene Ebene hinzugefuegt.' : 'Upload ist fuer deine Rolle deaktiviert.' }}
          </p>
        </div>

        <ProjectSettingsPanel v-else-if="activePanel === 'settings'" />
        <TeamManagementPanel v-else />
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
