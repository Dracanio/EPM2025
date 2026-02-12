<script setup lang="ts">
import { onBeforeUnmount, computed, ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import PosterCanvas from './PosterCanvas.vue'
import InspectorPanel from './Inspectors/InspectorPanel.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useEditorStore } from '@/core/store/useEditorStore'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'
import { downloadPdf } from '@/core/utils/exportPdf'
import { downloadPosterAsLatex, downloadPosterAsTypst } from '@/utils/exportLatexDto'
import type { PosterFormat } from '@/core/models/poster'
import type { ProjectRole } from '@/core/models/accessControl'
import { Lock } from 'lucide-vue-next'

const store = useEditorStore()
const authStore = useAuthStore()
const accessStore = useProjectAccessStore()
const route = useRoute()
const router = useRouter()

const isSharedLinkSession = computed(() => route.name === 'shared-editor' || authStore.isLinkSession)
const sharedRole = computed(() => authStore.linkSession?.role || null)

const isViewerMode = computed(() => {
  if (authStore.isLinkSession) return sharedRole.value === 'viewer'

  const activeProjectId = store.activePoster?.id
  if (!activeProjectId || !authStore.isAuthenticated) return false
  const role = accessStore.resolveProjectRole(activeProjectId, authStore.user?.id, authStore.user?.email)
  return role === 'viewer'
})

const canEditProject = computed(() => !isViewerMode.value)
const currentProjectRole = computed<ProjectRole>(() => {
  if (authStore.isLinkSession) return authStore.linkSession?.role || 'viewer'
  const projectId = store.activePoster?.id
  if (!projectId) return 'owner'
  return accessStore.resolveProjectRole(projectId, authStore.user?.id, authStore.user?.email) || 'owner'
})

const canManagePages = computed(() => {
  const projectId = store.activePoster?.id
  if (!projectId) return true
  return accessStore.canRolePerform(projectId, currentProjectRole.value, 'managePages')
})

const canMoveAndResizeElements = computed(() => {
  const projectId = store.activePoster?.id
  if (!projectId) return true
  return accessStore.canRolePerform(projectId, currentProjectRole.value, 'moveAndResizeElements')
})

const canExportFiles = computed(() => {
  const projectId = store.activePoster?.id
  if (!projectId) return true
  return accessStore.canRolePerform(projectId, currentProjectRole.value, 'exportFiles')
})

const currentFormat = computed(() => {
  return store.activePoster?.format.split(' ')[0] || 'A4'
})

const currentOrientation = computed(() => {
  if (!store.activePoster) return 'portrait'
  return store.activePoster.widthMm > store.activePoster.heightMm ? 'landscape' : 'portrait'
})

const navbarContextLabel = computed(() => {
  if (isSharedLinkSession.value) {
    return sharedRole.value === 'viewer' ? 'Freigabe: Ansicht' : 'Freigabe: Bearbeiten'
  }
  const title = store.activePoster?.meta.title?.trim()
  return title ? `Editor: ${title}` : 'Editor'
})

function changeFormat(val: string) {
  if (!canEditProject.value) return
  store.resizePoster(val as PosterFormat, currentOrientation.value)
}

function setOrientation(val: 'portrait' | 'landscape') {
  if (!canEditProject.value) return
  store.resizePoster(currentFormat.value as PosterFormat, val)
}

function handlePrint() {
  if (!store.activePoster) return
  applyPrintPageSize(store.activePoster.widthMm, store.activePoster.heightMm)
  window.print()
}

const isExporting = ref(false)
const sourceExportState = ref<'idle' | 'latex' | 'typst'>('idle')
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
let autosaveTimeoutId: number | null = null
let saveBadgeTimeoutId: number | null = null
let printPageStyleElement: HTMLStyleElement | null = null

async function handleExportPdf() {
  if (!store.activePoster || !canExportFiles.value) return
  isExporting.value = true
  await nextTick()

  setTimeout(async () => {
    if (!store.activePoster) {
      isExporting.value = false
      return
    }
    await downloadPdf(
      'poster-print-page',
      `${store.activePoster.meta.title || 'poster'}.pdf`,
      store.activePoster.widthMm,
      store.activePoster.heightMm
    )
    isExporting.value = false
  }, 500)
}

async function handleExportLatex() {
  if (!store.activePoster || !canExportFiles.value) return
  sourceExportState.value = 'latex'
  await downloadPosterAsLatex(store.activePoster)
  window.setTimeout(() => {
    if (sourceExportState.value === 'latex') sourceExportState.value = 'idle'
  }, 450)
}

function handleExportTypst() {
  if (!store.activePoster || !canExportFiles.value) return
  sourceExportState.value = 'typst'
  downloadPosterAsTypst(store.activePoster)
  window.setTimeout(() => {
    if (sourceExportState.value === 'typst') sourceExportState.value = 'idle'
  }, 450)
}

function ensureProjectAccess(projectId: string) {
  accessStore.ensureProjectAccess({
    projectId,
    ownerId: authStore.user?.id || 'shared-owner',
    ownerName: authStore.user?.name || 'Projekt Owner',
    ownerEmail: authStore.user?.email || 'owner@poster-designer.app'
  })
}

function loadPosterForSharedLink(projectId: string) {
  if (!store.activePoster || store.activePoster.id !== projectId) {
    const hasStoredPoster = store.loadPosterById(projectId)
    if (!hasStoredPoster) {
      store.initPoster('A4')
      if (store.activePoster) {
        store.updatePoster({
          id: projectId,
          meta: {
            ...store.activePoster.meta,
            title: 'Geteiltes Projekt'
          }
        })
        store.saveActivePoster()
      }
    }
  }
  ensureProjectAccess(projectId)
}

function loadPosterForEditorRoute(posterId: string) {
  if (!store.activePoster || store.activePoster.id !== posterId) {
    const hasStoredPoster = store.loadPosterById(posterId)
    if (!hasStoredPoster) {
      store.initPoster('A4')
      if (store.activePoster) {
        store.updatePoster({
          id: posterId,
          meta: {
            ...store.activePoster.meta,
            title: 'Neues Projekt'
          }
        })
        store.saveActivePoster()
      }
    }
  }
  ensureProjectAccess(posterId)
}

function ensurePosterForCurrentRoute() {
  if (authStore.isLinkSession && authStore.linkSession?.projectId) {
    loadPosterForSharedLink(authStore.linkSession.projectId)
    return
  }

  const posterId = typeof route.params.posterId === 'string' ? route.params.posterId : ''
  if (posterId) {
    loadPosterForEditorRoute(posterId)
    return
  }

  if (!store.activePoster) {
    store.initPoster('A4')
  }
}

function clearSaveTimers() {
  if (autosaveTimeoutId !== null) {
    window.clearTimeout(autosaveTimeoutId)
    autosaveTimeoutId = null
  }
  if (saveBadgeTimeoutId !== null) {
    window.clearTimeout(saveBadgeTimeoutId)
    saveBadgeTimeoutId = null
  }
}

function clearPrintPageSize() {
  if (!printPageStyleElement) return
  printPageStyleElement.remove()
  printPageStyleElement = null
}

function applyPrintPageSize(widthMm: number, heightMm: number) {
  clearPrintPageSize()

  const safeWidth = Number.isFinite(widthMm) ? Math.max(10, widthMm) : 210
  const safeHeight = Number.isFinite(heightMm) ? Math.max(10, heightMm) : 297
  const style = document.createElement('style')
  style.setAttribute('data-print-size', 'poster')
  style.textContent = `@media print { @page { size: ${safeWidth}mm ${safeHeight}mm; margin: 0; } }`
  document.head.appendChild(style)
  printPageStyleElement = style

  const cleanup = () => {
    clearPrintPageSize()
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
}

function setSavedBadge() {
  saveState.value = 'saved'
  if (saveBadgeTimeoutId !== null) window.clearTimeout(saveBadgeTimeoutId)
  saveBadgeTimeoutId = window.setTimeout(() => {
    if (saveState.value === 'saved') saveState.value = 'idle'
  }, 1300)
}

function persistPosterNow() {
  if (!canEditProject.value || !store.activePoster) return
  saveState.value = 'saving'
  const persisted = store.saveActivePoster()
  if (!persisted) {
    saveState.value = 'error'
    return
  }
  setSavedBadge()
}

function scheduleAutosave() {
  if (!canEditProject.value || !store.activePoster) return
  if (autosaveTimeoutId !== null) window.clearTimeout(autosaveTimeoutId)
  saveState.value = 'saving'

  autosaveTimeoutId = window.setTimeout(() => {
    const persisted = store.saveActivePoster()
    if (!persisted) {
      saveState.value = 'error'
      autosaveTimeoutId = null
      return
    }
    autosaveTimeoutId = null
    setSavedBadge()
  }, 700)
}

watch(
  () => [route.name, route.params.posterId, authStore.linkSession?.projectId, authStore.sessionMode],
  () => {
    ensurePosterForCurrentRoute()
  },
  { immediate: true }
)

watch(
  () => store.activePoster,
  () => {
    scheduleAutosave()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (store.isDirty && canEditProject.value) {
    store.saveActivePoster()
  }
  clearSaveTimers()
  clearPrintPageSize()
})

function goLoginFromShared() {
  router.push('/login')
}
</script>

<template>
  <div>
    <AppNavbar v-if="!isSharedLinkSession" active-section="editor" :context-label="navbarContextLabel" />
    <header v-else class="shared-link-header px-3 px-lg-4">
      <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap py-2">
        <div>
          <p class="small text-secondary mb-0">Geteilter Zugriff</p>
          <p class="fw-semibold mb-0">{{ store.activePoster?.meta.title || 'Projekt' }}</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge shared-link-role" :class="sharedRole === 'viewer' ? 'is-view' : 'is-edit'">
            {{ sharedRole === 'viewer' ? 'Nur Ansicht' : 'Kann bearbeiten' }}
          </span>
          <button v-if="!authStore.isAuthenticated" type="button" class="btn btn-outline-secondary btn-sm" @click="goLoginFromShared">
            Login
          </button>
        </div>
      </div>
    </header>

    <div class="editor-shell" :class="{ 'is-shared-shell': isSharedLinkSession }">
      <header class="editor-topbar px-3 py-2">
        <div class="d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center gap-2">
          <div class="d-flex align-items-center flex-wrap gap-2" v-if="canEditProject">
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

              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                title="Seite hinzufuegen"
                :disabled="!canManagePages"
                @click="store.addPage()"
              >
                <span v-if="canManagePages">+</span>
                <Lock v-else :size="12" />
              </button>
              <button
                v-if="store.activePoster.pages.length > 1"
                type="button"
                class="btn btn-outline-danger btn-sm"
                title="Seite loeschen"
                :disabled="!canManagePages"
                @click="store.deletePage(store.activePageId!)"
              >
                <span v-if="canManagePages">x</span>
                <Lock v-else :size="12" />
              </button>
            </div>
            <div v-if="!canManagePages" class="small text-secondary fw-semibold d-inline-flex align-items-center gap-1">
              <Lock :size="13" />
              Seitenverwaltung fuer deine Rolle deaktiviert
            </div>
          </div>
          <div v-else class="small text-secondary fw-semibold">Ansichtsmodus: Bearbeitung deaktiviert</div>

          <div class="d-flex align-items-center gap-2">
            <button v-if="canEditProject" type="button" class="btn btn-outline-secondary btn-sm" @click="persistPosterNow">
              <span v-if="saveState === 'saving'">Speichert...</span>
              <span v-else>Speichern</span>
            </button>
            <span v-if="canEditProject && saveState === 'saved'" class="small text-success fw-semibold">Gespeichert</span>
            <span v-if="canEditProject && saveState === 'error'" class="small text-danger fw-semibold">Speichern fehlgeschlagen</span>

            <div class="input-group input-group-sm" style="width: 120px;">
              <button type="button" class="btn btn-outline-secondary" @click="store.zoomOut()">-</button>
              <span class="form-control text-center bg-white">{{ Math.round(store.zoomLevel * 100) }}%</span>
              <button type="button" class="btn btn-outline-secondary" @click="store.zoomIn()">+</button>
            </div>

            <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="!canExportFiles" @click="handleExportPdf">
              <span v-if="isExporting">Exporting...</span>
              <span v-else>PDF Export</span>
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="!canExportFiles || sourceExportState === 'typst'"
              @click="handleExportLatex"
            >
              <span v-if="sourceExportState === 'latex'">Exporting...</span>
              <span v-else>LaTeX</span>
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="!canExportFiles || sourceExportState === 'latex'"
              @click="handleExportTypst"
            >
              <span v-if="sourceExportState === 'typst'">Exporting...</span>
              <span v-else>Typst</span>
            </button>

            <button type="button" class="btn btn-dark btn-sm" @click="handlePrint">Drucken</button>
          </div>
        </div>
        <div v-if="!canExportFiles" class="small text-secondary fw-semibold mt-2 d-inline-flex align-items-center gap-1">
          <Lock :size="13" />
          Export ist fuer deine Rolle deaktiviert.
        </div>
      </header>

      <div class="editor-main">
        <Sidebar v-if="canEditProject" />

        <main class="editor-canvas">
          <PosterCanvas v-if="store.activePoster" :read-only="isViewerMode" :allow-move-resize="canMoveAndResizeElements" />
        </main>

        <aside class="editor-right" v-if="canEditProject">
          <InspectorPanel />
        </aside>
        <aside class="editor-right p-3" v-else>
          <div class="border rounded p-3 bg-light">
            <p class="fw-semibold mb-1">Viewer Zugriff</p>
            <p class="small text-secondary mb-0">Dieses Dokument wurde als schreibgeschuetzte Freigabe geoeffnet.</p>
          </div>
        </aside>
      </div>

      <div class="editor-export-layer" :class="{ 'is-exporting': isExporting }">
        <div
          v-for="page in store.activePoster?.pages"
          :key="page.id"
          class="poster-print-page"
          :style="{
            width: `${store.activePoster?.widthMm || 210}mm`,
            height: `${store.activePoster?.heightMm || 297}mm`
          }"
        >
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

<style scoped>
.shared-link-header {
  border-bottom: 1px solid var(--panel-border);
  background: #ffffff;
}

.shared-link-role {
  font-size: 0.75rem;
  border: 1px solid transparent;
}

.shared-link-role.is-view {
  background: #edf3ff;
  color: #20479c;
  border-color: #cedeff;
}

.shared-link-role.is-edit {
  background: #e8f8ee;
  color: #136934;
  border-color: #c6ebd2;
}

.editor-shell.is-shared-shell {
  height: calc(100dvh - 53px);
}

@media print {
  .editor-shell.is-shared-shell {
    height: auto !important;
  }
}
</style>
