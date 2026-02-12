<script setup lang="ts">
import { onMounted, computed, ref, nextTick } from 'vue'
import Sidebar from './Sidebar.vue'
import PosterCanvas from './PosterCanvas.vue'
import InspectorPanel from './Inspectors/InspectorPanel.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useEditorStore } from '@/core/store/useEditorStore'
import { downloadPdf } from '@/core/utils/exportPdf'
import type { PosterFormat } from '@/core/models/poster'

const store = useEditorStore()

const currentFormat = computed(() => {
  return store.activePoster?.format.split(' ')[0] || 'A4'
})

const currentOrientation = computed(() => {
  if (!store.activePoster) return 'portrait'
  return store.activePoster.widthMm > store.activePoster.heightMm ? 'landscape' : 'portrait'
})

const navbarContextLabel = computed(() => {
  const title = store.activePoster?.meta.title?.trim()
  return title ? `Editor: ${title}` : 'Editor'
})

function changeFormat(val: string) {
  store.resizePoster(val as PosterFormat, currentOrientation.value)
}

function setOrientation(val: 'portrait' | 'landscape') {
  store.resizePoster(currentFormat.value as PosterFormat, val)
}

function handlePrint() {
  window.print()
}

const isExporting = ref(false)

async function handleExportPdf() {
  isExporting.value = true
  await nextTick()

  setTimeout(async () => {
    await downloadPdf('poster-print-page', `${store.activePoster?.meta.title || 'poster'}.pdf`)
    isExporting.value = false
  }, 500)
}

onMounted(() => {
  if (!store.activePoster) {
    store.initPoster('A4')
  }
})
</script>

<template>
  <div>
    <AppNavbar active-section="editor" :context-label="navbarContextLabel" />

    <div class="editor-shell">
      <header class="editor-topbar px-3 py-2">
        <div class="d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center gap-2">
          <div class="d-flex align-items-center flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
              <select
                :value="currentFormat"
                class="form-select form-select-sm"
                style="width: 130px;"
                @change="(e) => changeFormat((e.target as HTMLSelectElement).value)"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Flyer">Flyer (DIN Lang)</option>
              </select>

              <div class="btn-group btn-group-sm" role="group" aria-label="Ausrichtung">
                <button
                  type="button"
                  class="btn"
                  :class="currentOrientation === 'portrait' ? 'btn-secondary' : 'btn-outline-secondary'"
                  title="Hochformat"
                  @click="setOrientation('portrait')"
                >
                  <svg width="12" height="16" viewBox="0 0 12 16">
                    <rect x="1" y="1" width="10" height="14" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="currentOrientation === 'landscape' ? 'btn-secondary' : 'btn-outline-secondary'"
                  title="Querformat"
                  @click="setOrientation('landscape')"
                >
                  <svg width="16" height="12" viewBox="0 0 16 12">
                    <rect x="1" y="1" width="14" height="10" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="store.activePoster && store.activePoster.pages.length > 0" class="d-flex align-items-center gap-2 ms-xl-2">
              <span class="small fw-semibold">Seite:</span>

              <div class="btn-group btn-group-sm" role="group" aria-label="Seiten">
                <button
                  v-for="(page, idx) in store.activePoster.pages"
                  :key="page.id"
                  type="button"
                  class="btn"
                  :class="store.activePageId === page.id ? 'btn-secondary' : 'btn-outline-secondary'"
                  @click="store.setActivePage(page.id)"
                >
                  {{ idx + 1 }}
                </button>
              </div>

              <button type="button" class="btn btn-outline-secondary btn-sm" title="Seite hinzufuegen" @click="store.addPage()">
                +
              </button>
              <button
                v-if="store.activePoster.pages.length > 1"
                type="button"
                class="btn btn-outline-danger btn-sm"
                title="Seite loeschen"
                @click="store.deletePage(store.activePageId!)"
              >
                x
              </button>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <div class="input-group input-group-sm" style="width: 120px;">
              <button type="button" class="btn btn-outline-secondary" @click="store.zoomOut()">-</button>
              <span class="form-control text-center bg-white">{{ Math.round(store.zoomLevel * 100) }}%</span>
              <button type="button" class="btn btn-outline-secondary" @click="store.zoomIn()">+</button>
            </div>

            <button type="button" class="btn btn-outline-secondary btn-sm" @click="handleExportPdf">
              <span v-if="isExporting">Exporting...</span>
              <span v-else>PDF Export</span>
            </button>

            <button type="button" class="btn btn-dark btn-sm" @click="handlePrint">Drucken</button>
          </div>
        </div>
      </header>

      <div class="editor-main">
        <Sidebar />

        <main class="editor-canvas">
          <PosterCanvas v-if="store.activePoster" />
        </main>

        <aside class="editor-right">
          <InspectorPanel />
        </aside>
      </div>

      <div class="editor-export-layer" :class="{ 'is-exporting': isExporting }">
        <div v-for="page in store.activePoster?.pages" :key="page.id" class="poster-print-page">
          <PosterCanvas
            :elements="page.elements"
            :widthMm="store.activePoster?.widthMm"
            :heightMm="store.activePoster?.heightMm"
            :readOnly="true"
            :pageId="page.id"
          />
        </div>
      </div>
    </div>
  </div>
</template>
