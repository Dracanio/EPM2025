<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, SlidersHorizontal, X } from 'lucide-vue-next'
import TemplatePreview from '@/components/ui/TemplatePreview.vue'
import type { BrandKit, BrandKitId, FormatCategory, FormatPreset, HomeTemplateItem } from '../homeData'

export interface CreateProjectPayload {
  projectName: string
  brandKitId: BrandKitId
  formatPresetId: string
  templateId?: string
}

const props = defineProps<{
  open: boolean
  initialProjectName: string
  brandKits: BrandKit[]
  defaultBrandKitId: BrandKitId
  formatPresets: FormatPreset[]
  templates: HomeTemplateItem[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', payload: CreateProjectPayload): void
}>()

const projectName = ref('')
const selectedBrandKitId = ref<BrandKitId>(props.defaultBrandKitId)
const selectedFormatPresetId = ref('')
const selectedCategory = ref<FormatCategory>('all')
const selectedTemplateId = ref<string>()

const filteredFormats = computed(() => {
  if (selectedCategory.value === 'all') return props.formatPresets
  return props.formatPresets.filter((item) => item.category === selectedCategory.value || item.category === 'all')
})

const brandTemplates = computed(() =>
  props.templates.filter((item) => item.brandKitId === selectedBrandKitId.value)
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    projectName.value = props.initialProjectName
    selectedBrandKitId.value = props.defaultBrandKitId
    selectedCategory.value = 'all'
    selectedFormatPresetId.value = props.formatPresets.find((preset) => preset.recommended)?.id || props.formatPresets[0]?.id || ''
    selectedTemplateId.value = brandTemplates.value[0]?.template.id
  }
)

watch(selectedBrandKitId, () => {
  selectedTemplateId.value = brandTemplates.value[0]?.template.id
})

function close() {
  emit('close')
}

function submit() {
  if (!projectName.value.trim() || !selectedFormatPresetId.value) return
  emit('create', {
    projectName: projectName.value.trim(),
    brandKitId: selectedBrandKitId.value,
    formatPresetId: selectedFormatPresetId.value,
    templateId: selectedTemplateId.value
  })
}
</script>

<template>
  <div v-if="props.open" class="create-modal-backdrop" @click.self="close">
    <div class="create-modal-shell card border-0 shadow-lg">
      <button type="button" class="btn btn-light create-modal-close" @click="close">
        <X :size="18" />
      </button>

      <div class="create-modal-grid">
        <aside class="create-modal-sidebar border-end">
          <section class="mb-4">
            <h2 class="create-modal-title mb-1">Projekt Details</h2>
            <p class="text-secondary mb-3">Gib deinem Projekt einen Namen</p>
            <label class="form-label fw-semibold mb-1">Name</label>
            <input v-model="projectName" type="text" class="form-control" maxlength="80" />
          </section>

          <section class="pt-3 border-top">
            <h2 class="create-modal-title mb-1">Brand Kit</h2>
            <p class="text-secondary mb-3">Wähle das Design-System</p>
            <div class="vstack gap-2">
              <button
                v-for="brandKit in props.brandKits"
                :key="brandKit.id"
                type="button"
                class="btn text-start create-brand-kit-btn"
                :class="{ 'is-active': selectedBrandKitId === brandKit.id }"
                @click="selectedBrandKitId = brandKit.id"
              >
                <span class="create-brand-kit-badge">{{ brandKit.badge }}</span>
                <span class="flex-grow-1">
                  <span class="d-block fw-semibold">{{ brandKit.name }}</span>
                  <span class="text-secondary">{{ brandKit.subtitle }}</span>
                </span>
                <Check v-if="selectedBrandKitId === brandKit.id" :size="16" />
              </button>
            </div>
          </section>
        </aside>

        <section class="create-modal-main">
          <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">
            <div>
              <h2 class="create-modal-title mb-1">Format wählen</h2>
              <p class="text-secondary mb-0">Für welche Plattform möchtest du gestalten?</p>
            </div>

            <div class="btn-group">
              <button
                type="button"
                class="btn create-category-toggle"
                :class="{ 'is-active': selectedCategory === 'all' }"
                @click="selectedCategory = 'all'"
              >
                Alle
              </button>
              <button
                type="button"
                class="btn create-category-toggle"
                :class="{ 'is-active': selectedCategory === 'social' }"
                @click="selectedCategory = 'social'"
              >
                Social Media
              </button>
              <button
                type="button"
                class="btn create-category-toggle"
                :class="{ 'is-active': selectedCategory === 'print' }"
                @click="selectedCategory = 'print'"
              >
                Druck
              </button>
            </div>
          </div>

          <div class="row g-3 mb-4">
            <div v-for="preset in filteredFormats" :key="preset.id" class="col-12 col-sm-6 col-xl-4">
              <button
                type="button"
                class="card w-100 text-start create-format-card"
                :class="{ 'is-active': selectedFormatPresetId === preset.id }"
                @click="selectedFormatPresetId = preset.id"
              >
                <span v-if="preset.recommended" class="badge rounded-pill bg-primary create-recommended-chip">Empfohlen</span>
                <div class="create-format-preview">
                  <div class="create-format-sheet" :class="`is-${preset.previewType}`" />
                </div>
                <div class="card-body">
                  <h3 class="create-format-name mb-1">{{ preset.name }}</h3>
                  <p class="text-secondary mb-0">{{ preset.sizeLabel }}</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h2 class="create-modal-title mb-1">Vorlagen für das Brand Kit</h2>
            <p class="text-secondary mb-3">Diese Vorschläge ändern sich je nach ausgewähltem Brand Kit.</p>
            <div class="row g-3">
              <div v-for="item in brandTemplates" :key="item.template.id" class="col-12 col-sm-6 col-xl-4">
                <button
                  type="button"
                  class="card w-100 text-start create-template-card"
                  :class="{ 'is-active': selectedTemplateId === item.template.id }"
                  @click="selectedTemplateId = item.template.id"
                >
                  <div class="create-template-thumb">
                    <TemplatePreview :template="item.template" />
                  </div>
                  <div class="card-body">
                    <h3 class="create-format-name mb-1">{{ item.template.name }}</h3>
                    <p class="text-secondary mb-0">{{ item.previewLabel }}</p>
                  </div>
                </button>
              </div>
              <div class="col-12 col-sm-6 col-xl-4">
                <button type="button" class="card w-100 text-start create-template-card is-empty" @click="selectedTemplateId = undefined">
                  <div class="create-template-thumb create-template-thumb-empty">
                    <SlidersHorizontal :size="24" />
                  </div>
                  <div class="card-body">
                    <h3 class="create-format-name mb-1">Benutzerdefiniert</h3>
                    <p class="text-secondary mb-0">Ohne Vorlage starten</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer class="create-modal-footer border-top">
        <button type="button" class="btn btn-outline-secondary px-4" @click="close">Abbrechen</button>
        <button type="button" class="btn btn-primary px-4" @click="submit">Erstellen</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.create-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  z-index: 320;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.create-modal-shell {
  width: min(1320px, 100%);
  max-height: calc(100vh - 2.5rem);
  overflow: auto;
  position: relative;
}

.create-modal-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 8;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  background: #ffffff;
  color: #4b4560;
}

.create-modal-close:hover {
  border-color: var(--color-brand-indigo);
  color: var(--color-brand-indigo);
}

.create-modal-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  margin-top: 2.4rem;
}

.create-modal-sidebar,
.create-modal-main {
  padding: 1.6rem 1.6rem 1.25rem;
}

.create-modal-title {
  font-size: 2rem;
  line-height: 1.2;
  font-weight: 700;
}

.create-brand-kit-btn {
  border: 1px solid var(--color-border-strong);
  border-radius: 0.75rem;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
}

.create-brand-kit-btn.is-active {
  border-color: var(--color-brand-indigo);
  box-shadow: 0 0 0 1px var(--color-brand-indigo);
  background: rgba(89, 82, 225, 0.08);
}

.create-brand-kit-badge {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.6rem;
  background: var(--color-ink-strong);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
}

.create-format-card,
.create-template-card {
  border-color: var(--panel-border);
  position: relative;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.create-format-card:hover,
.create-template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.6rem 1.3rem rgba(0, 0, 0, 0.09);
}

.create-format-card.is-active,
.create-template-card.is-active {
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 1px var(--color-brand-primary);
}

.create-recommended-chip {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: var(--color-brand-primary) !important;
}

.create-format-preview {
  margin: 1rem 1rem 0;
  border-radius: 0.65rem;
  background: #d6d2ea;
  height: 126px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-format-sheet {
  background: #f8fafc;
  border-radius: 0.25rem;
}

.create-format-sheet.is-portrait {
  width: 52px;
  height: 88px;
}

.create-format-sheet.is-square {
  width: 74px;
  height: 74px;
}

.create-format-sheet.is-landscape {
  width: 94px;
  height: 54px;
}

.create-template-thumb {
  margin: 1rem 1rem 0;
  border-radius: 0.55rem;
  height: 96px;
  overflow: hidden;
  background: #c7c2ce;
}

.create-template-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #635b78;
  background: #ece8f3;
}

.create-template-card.is-empty {
  border-style: dashed;
}

.create-format-name {
  font-size: 1.45rem;
  line-height: 1.3;
  font-weight: 700;
}

.create-modal-footer {
  padding: 1rem 1.6rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

.create-category-toggle {
  border-color: var(--color-border-strong);
  color: #4d4660;
  background: #ffffff;
  font-weight: 600;
}

.create-category-toggle:hover {
  border-color: var(--color-brand-indigo);
  color: var(--color-brand-indigo);
  background: rgba(89, 82, 225, 0.08);
}

.create-category-toggle.is-active {
  border-color: var(--color-brand-indigo);
  color: #ffffff;
  background: var(--color-brand-indigo);
}

@media (max-width: 1199px) {
  .create-modal-grid {
    grid-template-columns: 1fr;
  }

  .create-modal-sidebar {
    border-right: 0 !important;
    border-bottom: 1px solid var(--panel-border);
  }
}

@media (max-width: 767px) {
  .create-modal-title {
    font-size: 1.55rem;
  }
}
</style>
