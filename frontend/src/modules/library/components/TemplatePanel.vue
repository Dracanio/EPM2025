<script setup lang="ts">
import TemplatePreview from '@/components/ui/TemplatePreview.vue'
import type { HomeTemplateItem } from '../homeData'

type PanelMode = 'compact' | 'preview'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle: string
    mode: PanelMode
    templates: HomeTemplateItem[]
    emptyTitle: string
    emptyBody: string
  }>(),
  {}
)

const emit = defineEmits<{
  (e: 'toggle-mode'): void
  (e: 'open-template', item: HomeTemplateItem): void
}>()

function open(item: HomeTemplateItem) {
  emit('open-template', item)
}
</script>

<template>
  <section class="card h-100">
    <div class="card-body">
      <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h2 class="library-section-title mb-0">{{ props.title }}</h2>
          <p class="text-secondary mb-0">{{ props.subtitle }}</p>
        </div>
        <button type="button" class="btn btn-link p-0 text-decoration-none fw-semibold" @click="emit('toggle-mode')">
          {{ props.mode === 'compact' ? 'Alle Vorlagen' : 'Kompaktansicht' }}
        </button>
      </div>

      <div v-if="props.templates.length === 0" class="library-empty card border-0 bg-body-tertiary">
        <div class="card-body py-4">
          <p class="fw-semibold mb-1">{{ props.emptyTitle }}</p>
          <p class="text-secondary mb-0">{{ props.emptyBody }}</p>
        </div>
      </div>

      <div v-else-if="props.mode === 'compact'" class="vstack gap-2">
        <button
          v-for="item in props.templates"
          :key="item.template.id"
          type="button"
          class="list-group-item list-group-item-action border rounded d-flex gap-3 align-items-center library-template-list-item"
          @click="open(item)"
        >
          <div class="library-template-list-thumb">
            <TemplatePreview :template="item.template" />
          </div>
          <div class="text-start">
            <h3 class="library-template-title mb-1">{{ item.template.name }}</h3>
            <p class="library-template-meta text-secondary mb-0">{{ item.previewLabel }}</p>
          </div>
        </button>
      </div>

      <div v-else class="row g-3">
        <div v-for="item in props.templates" :key="item.template.id" class="col-12 col-sm-6 col-xl-12">
          <button type="button" class="card w-100 text-start h-100 library-template-preview-card" @click="open(item)">
            <div class="library-template-preview-thumb">
              <TemplatePreview :template="item.template" />
            </div>
            <div class="card-body">
              <h3 class="library-template-title mb-1">{{ item.template.name }}</h3>
              <span class="badge rounded-pill text-primary-emphasis bg-primary-subtle library-template-meta">{{ item.previewLabel }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.library-section-title {
  font-size: 2rem;
  line-height: 1.2;
  font-weight: 700;
}

.library-template-title {
  font-size: 1.3rem;
  line-height: 1.3;
  font-weight: 700;
}

.library-template-meta {
  font-size: 0.95rem;
  font-weight: 500;
}

.library-template-list-item {
  background: #ffffff;
  border-color: var(--panel-border);
}

.library-template-list-thumb {
  width: 58px;
  height: 78px;
  border-radius: 0.35rem;
  flex-shrink: 0;
  overflow: hidden;
  background: #c7c2ce;
}

.library-template-preview-card {
  border-color: var(--panel-border);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.library-template-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.6rem 1.3rem rgba(0, 0, 0, 0.09);
}

.library-template-preview-thumb {
  margin: 0.65rem;
  border-radius: 0.55rem;
  height: 138px;
  overflow: hidden;
  background: #c7c2ce;
}

.library-empty {
  border: 1px dashed #cfd4dc;
}
</style>
