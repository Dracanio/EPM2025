<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import AppNavbar from '@/components/AppNavbar.vue'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useEditorStore } from '@/core/store/useEditorStore'
import type { PosterFormat } from '@/core/models/poster'
import CreateProjectModal, { type CreateProjectPayload } from './components/CreateProjectModal.vue'
import ProjectCard from './components/ProjectCard.vue'
import TemplatePanel from './components/TemplatePanel.vue'
import {
  applyBrandKitToPoster,
  applyBrandKitToTemplate,
  BRAND_KITS,
  createMockProjects,
  FORMAT_PRESETS,
  getTemplatesForBrandKit,
  TEMPLATE_LIBRARY_ITEMS,
  type BrandKitId,
  type HomeProject,
  type ProjectScope
} from './homeData'

type ProjectSort = 'recent' | 'oldest' | 'name'
type ProjectLayout = 'grid' | 'list'
type TemplatePanelMode = 'compact' | 'preview'

const HOME_PROJECTS_KEY = 'poster_studio_home_projects'
const HOME_PROJECTS_LIMIT = 6

const USE_MOCK_HOME_DATA =
  import.meta.env.VITE_USE_MOCK_HOME_DATA === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_HOME_DATA !== 'false')

const copy = {
  welcomeSubtitle: 'Starte mit einer Vorlage oder öffne eines deiner letzten Poster-Projekte.',
  recentProjectsTitle: 'Deine letzten Projekte',
  recentProjectsSubtitle: 'Zuletzt bearbeitete Poster',
  templatesTitle: 'Vorlagen zum Starten',
  templatesSubtitle: 'Schnell loslegen mit kuratierten Designs.',
  allProjectsTitle: 'Alle Projekte',
  allProjectsSubtitle: 'Übersicht über alle erstellten Designs und Kollaborationen',
  noProjectsTitle: 'Noch keine Projekte vorhanden',
  noProjectsBody: 'Erstelle dein erstes Projekt oder starte mit einer Vorlage.',
  noTemplatesTitle: 'Keine Vorlagen verfügbar',
  noTemplatesBody: 'Sobald Vorlagen vorhanden sind, erscheinen sie hier.'
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const editorStore = useEditorStore()

const sortOption = ref<ProjectSort>('recent')
const scopeOption = ref<'all' | ProjectScope>('all')
const projectLayout = ref<ProjectLayout>('grid')
const templatePanelMode = ref<TemplatePanelMode>('compact')
const showCreateModal = ref(false)
const initialProjectName = ref('Neues Projekt')
const projects = ref<HomeProject[]>(loadProjects())
const isProjectsView = computed(() => route.name === 'projects')

const templateById = computed(() => {
  const map = new Map<string, (typeof TEMPLATE_LIBRARY_ITEMS)[number]>()
  for (const item of TEMPLATE_LIBRARY_ITEMS) {
    map.set(item.template.id, item)
  }
  return map
})

const userFirstName = computed(() => authStore.user?.name?.split(/\s+/)[0] || 'Nutzer')

const homeTemplateCandidates = computed(() => getTemplatesForBrandKit('hs_standard'))
const homeTemplates = computed(() => {
  if (templatePanelMode.value === 'preview') return homeTemplateCandidates.value
  return homeTemplateCandidates.value.slice(0, 3)
})

const filteredProjects = computed(() => {
  if (scopeOption.value === 'all') return projects.value
  return projects.value.filter((entry) => entry.scope === scopeOption.value)
})

const sortedProjects = computed(() => {
  const values = [...filteredProjects.value]
  if (sortOption.value === 'name') {
    return values.sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }

  values.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
  if (sortOption.value === 'recent') values.reverse()
  return values
})

const homeProjects = computed(() => sortedProjects.value.slice(0, HOME_PROJECTS_LIMIT))

function loadProjects(): HomeProject[] {
  const storedProjects = readStoredProjects()
  if (storedProjects.length > 0) return storedProjects
  if (!USE_MOCK_HOME_DATA) return []

  const seededProjects = createMockProjects()
  writeStoredProjects(seededProjects)
  return seededProjects
}

function readStoredProjects(): HomeProject[] {
  const raw = window.localStorage.getItem(HOME_PROJECTS_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => normalizeProject(entry))
      .filter((entry): entry is HomeProject => entry !== null)
  } catch {
    return []
  }
}

function normalizeProject(value: unknown): HomeProject | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<HomeProject>
  if (typeof candidate.id !== 'string') return null
  if (typeof candidate.name !== 'string') return null
  if (!isPosterFormat(candidate.format)) return null
  if (typeof candidate.updatedAt !== 'string') return null
  if (Number.isNaN(new Date(candidate.updatedAt).getTime())) return null

  return {
    id: candidate.id,
    name: candidate.name,
    format: candidate.format,
    updatedAt: candidate.updatedAt,
    tag: typeof candidate.tag === 'string' ? candidate.tag : candidate.format,
    scope: isProjectScope(candidate.scope) ? candidate.scope : 'mine',
    brandKitId: isBrandKitId(candidate.brandKitId) ? candidate.brandKitId : 'hs_standard',
    templateId: typeof candidate.templateId === 'string' ? candidate.templateId : undefined,
    collaborator: typeof candidate.collaborator === 'string' ? candidate.collaborator : undefined
  }
}

function isProjectScope(value: unknown): value is ProjectScope {
  return value === 'mine' || value === 'shared'
}

function isBrandKitId(value: unknown): value is BrandKitId {
  return value === 'hs_standard' || value === 'medieninformatik' || value === 'no_brand'
}

function isPosterFormat(value: unknown): value is PosterFormat {
  return value === 'A4' || value === 'A4 Landscape' || value === 'A3' || value === 'A2' || value === 'Flyer'
}

function writeStoredProjects(entries: HomeProject[]) {
  window.localStorage.setItem(HOME_PROJECTS_KEY, JSON.stringify(entries))
}

function upsertProject(project: HomeProject) {
  const remaining = projects.value.filter((entry) => entry.id !== project.id)
  projects.value = [project, ...remaining]
  writeStoredProjects(projects.value)
}

function removeProject(projectId: string) {
  projects.value = projects.value.filter((entry) => entry.id !== projectId)
  writeStoredProjects(projects.value)
}

function openCreateProjectModal(name = 'Neues Projekt') {
  initialProjectName.value = name
  showCreateModal.value = true
}

function closeCreateProjectModal() {
  showCreateModal.value = false
}

function createProjectFromModal(payload: CreateProjectPayload) {
  const preset = FORMAT_PRESETS.find((item) => item.id === payload.formatPresetId)
  if (!preset) return

  const templateItem = payload.templateId ? templateById.value.get(payload.templateId) : undefined

  if (templateItem) {
    editorStore.createPosterFromTemplate(applyBrandKitToTemplate(templateItem.template, payload.brandKitId))
  } else {
    editorStore.initPoster(preset.posterFormat)
  }

  if (!editorStore.activePoster) return

  editorStore.updatePoster(applyBrandKitToPoster(editorStore.activePoster, payload.brandKitId, payload.projectName))

  upsertProject({
    id: editorStore.activePoster.id,
    name: payload.projectName,
    format: editorStore.activePoster.format,
    updatedAt: new Date().toISOString(),
    tag: templateItem?.previewLabel ?? preset.name,
    scope: 'mine',
    brandKitId: payload.brandKitId,
    templateId: templateItem?.template.id
  })

  closeCreateProjectModal()
  router.push(`/editor/${editorStore.activePoster.id}`)
}

function openTemplateFromHome(item: (typeof TEMPLATE_LIBRARY_ITEMS)[number]) {
  createProjectFromModal({
    projectName: item.template.name,
    brandKitId: item.brandKitId,
    formatPresetId: 'a4_portrait',
    templateId: item.template.id
  })
}

function openProject(project: HomeProject) {
  const brandKitId = project.brandKitId || 'hs_standard'
  const templateItem = project.templateId ? templateById.value.get(project.templateId) : undefined

  if (templateItem) {
    editorStore.createPosterFromTemplate(applyBrandKitToTemplate(templateItem.template, brandKitId))
  } else {
    editorStore.initPoster(project.format)
  }
  if (!editorStore.activePoster) return

  editorStore.updatePoster(applyBrandKitToPoster(editorStore.activePoster, brandKitId, project.name))

  upsertProject({
    ...project,
    id: editorStore.activePoster.id,
    brandKitId,
    updatedAt: new Date().toISOString()
  })
  router.push(`/editor/${editorStore.activePoster.id}`)
}

function duplicateProject(project: HomeProject) {
  const copyName = `${project.name} (Kopie)`
  upsertProject({
    ...project,
    id: crypto.randomUUID(),
    name: copyName,
    updatedAt: new Date().toISOString()
  })
}

function deleteProject(project: HomeProject) {
  const accepted = window.confirm(`Projekt "${project.name}" wirklich löschen?`)
  if (!accepted) return
  removeProject(project.id)
}

function showAllProjects() {
  router.push('/projects')
}

function toggleTemplatePanel() {
  templatePanelMode.value = templatePanelMode.value === 'compact' ? 'preview' : 'compact'
}

function getRelativeTimeLabel(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  if (diffMs < 60 * 1000) return 'Gerade eben'

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
  if (diffHours < 24) return `vor ${diffHours} Std.`
  if (diffHours < 48) return 'Gestern'

  const diffDays = Math.floor(diffHours / 24)
  return `vor ${diffDays} Tagen`
}

function getShortDate(timestamp: string) {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' }).format(new Date(timestamp))
}

function getProjectTemplate(project: HomeProject) {
  if (!project.templateId) return undefined
  return templateById.value.get(project.templateId)?.template
}
</script>

<template>
  <div class="home-shell min-vh-100">
    <AppNavbar :active-section="isProjectsView ? 'projects' : 'templates'">
      <template #actions>
        <button type="button" class="btn btn-primary px-3 d-inline-flex align-items-center gap-2 home-create-btn" @click="openCreateProjectModal()">
          <Plus :size="16" />
          <span>Neues Projekt</span>
        </button>
      </template>
    </AppNavbar>

    <main class="container-fluid px-3 px-lg-4 py-4 py-lg-5">
      <section v-if="!isProjectsView">
        <header class="mb-4">
          <h1 class="home-main-title mb-1">Willkommen zurück, {{ userFirstName }}</h1>
          <p class="text-secondary mb-0">{{ copy.welcomeSubtitle }}</p>
        </header>

        <div class="row g-4 align-items-start">
          <div class="col-12 col-xl-8">
            <section class="card h-100">
              <div class="card-body">
                <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">
                  <div>
                    <h2 class="home-section-title mb-0">{{ copy.recentProjectsTitle }}</h2>
                    <p class="text-secondary mb-0">{{ copy.recentProjectsSubtitle }}</p>
                  </div>

                  <button type="button" class="btn btn-link p-0 text-decoration-none fw-semibold" @click="showAllProjects">
                    Alle Projekte ansehen
                  </button>
                </div>

                <div v-if="homeProjects.length === 0" class="home-empty card border-0 bg-body-tertiary">
                  <div class="card-body py-4">
                    <p class="fw-semibold mb-1">{{ copy.noProjectsTitle }}</p>
                    <p class="text-secondary mb-3">{{ copy.noProjectsBody }}</p>
                    <button type="button" class="btn btn-primary btn-sm" @click="openCreateProjectModal()">Neues Projekt anlegen</button>
                  </div>
                </div>

                <div v-else class="row g-3">
                  <div v-for="project in homeProjects" :key="project.id" class="col-12 col-md-6 col-xxl-4">
                    <ProjectCard
                      :project="project"
                      :preview-template="getProjectTemplate(project)"
                      variant="compact"
                      :time-label="getRelativeTimeLabel(project.updatedAt)"
                      :date-label="getShortDate(project.updatedAt)"
                      @open="openProject"
                      @duplicate="duplicateProject"
                      @delete="deleteProject"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="col-12 col-xl-4">
            <TemplatePanel
              :title="copy.templatesTitle"
              :subtitle="copy.templatesSubtitle"
              :mode="templatePanelMode"
              :templates="homeTemplates"
              :empty-title="copy.noTemplatesTitle"
              :empty-body="copy.noTemplatesBody"
              @toggle-mode="toggleTemplatePanel"
              @open-template="openTemplateFromHome"
            />
          </div>
        </div>
      </section>

      <section v-else>
        <header class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
          <div>
            <h1 class="home-main-title mb-1">{{ copy.allProjectsTitle }}</h1>
            <p class="text-secondary mb-0">{{ copy.allProjectsSubtitle }}</p>
          </div>

          <div class="d-flex align-items-center gap-2 flex-wrap">
            <select v-model="sortOption" class="form-select home-sort-select">
              <option value="recent">Sortieren: Zuletzt bearbeitet</option>
              <option value="oldest">Sortieren: Älteste zuerst</option>
              <option value="name">Sortieren: Name A-Z</option>
            </select>
            <div class="btn-group home-layout-group">
              <button
                type="button"
                class="btn home-layout-toggle"
                :class="{ 'is-active': projectLayout === 'grid' }"
                @click="projectLayout = 'grid'"
              >
                Raster
              </button>
              <button
                type="button"
                class="btn home-layout-toggle"
                :class="{ 'is-active': projectLayout === 'list' }"
                @click="projectLayout = 'list'"
              >
                Liste
              </button>
            </div>
          </div>
        </header>

        <div class="btn-group mb-4 home-scope-group">
          <button
            type="button"
            class="btn home-scope-toggle"
            :class="{ 'is-active': scopeOption === 'all' }"
            @click="scopeOption = 'all'"
          >
            Alle Projekte
          </button>
          <button
            type="button"
            class="btn home-scope-toggle"
            :class="{ 'is-active': scopeOption === 'mine' }"
            @click="scopeOption = 'mine'"
          >
            Von mir erstellt
          </button>
          <button
            type="button"
            class="btn home-scope-toggle"
            :class="{ 'is-active': scopeOption === 'shared' }"
            @click="scopeOption = 'shared'"
          >
            Von Mitarbeitern
          </button>
        </div>

        <div v-if="sortedProjects.length === 0" class="home-empty card border-0 bg-body-tertiary">
          <div class="card-body py-4">
            <p class="fw-semibold mb-1">{{ copy.noProjectsTitle }}</p>
            <p class="text-secondary mb-3">{{ copy.noProjectsBody }}</p>
            <button type="button" class="btn btn-primary btn-sm" @click="openCreateProjectModal()">Neues Projekt anlegen</button>
          </div>
        </div>

        <div v-else-if="projectLayout === 'grid'" class="row g-4">
          <div v-for="project in sortedProjects" :key="project.id" class="col-12 col-md-6 col-xl-4 col-xxl-3">
            <ProjectCard
              :project="project"
              :preview-template="getProjectTemplate(project)"
              variant="large"
              :time-label="getShortDate(project.updatedAt)"
              :date-label="getShortDate(project.updatedAt)"
              :show-collaborator="true"
              @open="openProject"
              @duplicate="duplicateProject"
              @delete="deleteProject"
            />
          </div>
        </div>

        <div v-else class="vstack gap-3">
          <ProjectCard
            v-for="project in sortedProjects"
            :key="project.id"
            :project="project"
            :preview-template="getProjectTemplate(project)"
            variant="list"
            :time-label="getRelativeTimeLabel(project.updatedAt)"
            :date-label="getShortDate(project.updatedAt)"
            :show-collaborator="true"
            @open="openProject"
            @duplicate="duplicateProject"
            @delete="deleteProject"
          />
        </div>
      </section>
    </main>
  </div>

  <CreateProjectModal
    :open="showCreateModal"
    :initial-project-name="initialProjectName"
    :brand-kits="BRAND_KITS"
    default-brand-kit-id="hs_standard"
    :format-presets="FORMAT_PRESETS"
    :templates="TEMPLATE_LIBRARY_ITEMS"
    @close="closeCreateProjectModal"
    @create="createProjectFromModal"
  />
</template>

<style scoped>
.home-shell {
  background: #f3f4f6;
}

.home-create-btn {
  font-size: 1rem;
  font-weight: 700;
  border: 1px solid var(--color-brand-indigo);
  background: var(--color-brand-indigo);
  box-shadow: 0 0.45rem 1rem rgba(89, 82, 225, 0.22);
}

.home-create-btn:hover {
  border-color: #4d46ce;
  background: #4d46ce;
}

.home-create-btn:focus-visible {
  box-shadow: 0 0 0 0.2rem var(--color-focus-ring);
}

.home-main-title {
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 700;
}

.home-section-title {
  font-size: 2rem;
  line-height: 1.2;
  font-weight: 700;
}

.home-sort-select {
  min-width: 16rem;
  border-color: var(--color-border-strong);
}

.home-sort-select:focus {
  border-color: var(--color-brand-violet);
  box-shadow: 0 0 0 0.2rem var(--color-focus-ring);
}

.home-layout-toggle,
.home-scope-toggle {
  border-color: var(--color-border-strong);
  color: #4d4660;
  background: #ffffff;
  font-weight: 600;
}

.home-layout-toggle:hover,
.home-scope-toggle:hover {
  border-color: var(--color-brand-indigo);
  color: var(--color-brand-indigo);
  background: rgba(89, 82, 225, 0.08);
}

.home-layout-toggle.is-active {
  border-color: var(--color-brand-indigo);
  color: #ffffff;
  background: var(--color-brand-indigo);
}

.home-scope-toggle.is-active {
  border-color: var(--color-brand-primary);
  color: #ffffff;
  background: var(--color-brand-primary);
}

.home-empty {
  border: 1px dashed #cfd4dc;
}

@media (max-width: 991px) {
  .home-main-title {
    font-size: 2.4rem;
  }

  .home-section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 767px) {
  .home-main-title {
    font-size: 2rem;
  }

  .home-sort-select {
    min-width: 100%;
  }
}
</style>
