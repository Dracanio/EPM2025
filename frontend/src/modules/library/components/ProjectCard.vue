<script setup lang="ts">
import type { Template } from '@/core/models/template'
import TemplatePreview from '@/components/ui/TemplatePreview.vue'
import ProjectItemActions from './ProjectItemActions.vue'
import type { HomeProject } from '../homeData'

type CardVariant = 'compact' | 'large' | 'list'

const props = withDefaults(
  defineProps<{
    project: HomeProject
    previewTemplate?: Template
    variant?: CardVariant
    timeLabel: string
    dateLabel: string
    showCollaborator?: boolean
  }>(),
  {
    variant: 'compact',
    showCollaborator: false
  }
)

const emit = defineEmits<{
  (e: 'open', project: HomeProject): void
  (e: 'duplicate', project: HomeProject): void
  (e: 'delete', project: HomeProject): void
}>()

function openProject() {
  emit('open', props.project)
}

function onAction(actionId: string) {
  if (actionId === 'delete') {
    emit('delete', props.project)
    return
  }
  if (actionId === 'duplicate') {
    emit('duplicate', props.project)
  }
}
</script>

<template>
  <article
    v-if="props.variant !== 'list'"
    class="card library-project-card h-100"
    role="button"
    tabindex="0"
    @click="openProject"
    @keydown.enter.prevent="openProject"
  >
    <ProjectItemActions class="library-actions-anchor" @select="onAction" />

    <div class="library-project-thumb" :class="{ 'is-large': props.variant === 'large' }">
      <TemplatePreview :template="props.previewTemplate" />
      <span v-if="props.showCollaborator && props.project.collaborator" class="badge rounded-pill bg-light text-dark library-collab-chip">
        {{ props.project.collaborator }}
      </span>
    </div>
    <div class="card-body">
      <h3 class="library-project-title mb-1 text-truncate">{{ props.project.name }}</h3>
      <div class="d-flex align-items-center justify-content-between gap-2">
        <span class="badge rounded-pill text-primary-emphasis bg-primary-subtle library-project-tag">{{ props.project.tag }}</span>
        <span class="library-project-time text-secondary">{{ props.timeLabel }}</span>
      </div>
    </div>
  </article>

  <article
    v-else
    class="card library-project-list-card"
    role="button"
    tabindex="0"
    @click="openProject"
    @keydown.enter.prevent="openProject"
  >
    <div class="card-body d-flex align-items-center gap-3">
      <div class="library-list-thumb flex-shrink-0">
        <TemplatePreview :template="props.previewTemplate" />
      </div>
      <div class="flex-grow-1 library-min-width-0">
        <h3 class="library-project-title mb-1 text-truncate">{{ props.project.name }}</h3>
        <p class="library-project-time text-secondary mb-0">{{ props.project.tag }}</p>
      </div>
      <div class="text-end">
        <div class="library-project-time text-secondary">{{ props.dateLabel }}</div>
        <div v-if="props.showCollaborator && props.project.collaborator" class="library-project-time text-secondary">
          {{ props.project.collaborator }}
        </div>
      </div>
      <ProjectItemActions @select="onAction" />
    </div>
  </article>
</template>

<style scoped>
.library-project-card,
.library-project-list-card {
  border-color: var(--panel-border);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  position: relative;
  overflow: visible;
}

.library-project-card:hover,
.library-project-list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.6rem 1.3rem rgba(0, 0, 0, 0.09);
  z-index: 2;
}

.library-project-list-card:focus-within,
.library-project-card:focus-within {
  z-index: 3;
}

.library-project-thumb {
  position: relative;
  margin: 0.65rem;
  border-radius: 0.55rem;
  height: 126px;
  overflow: hidden;
  background: #c7c2ce;
}

.library-project-thumb.is-large {
  height: 198px;
}

.library-actions-anchor {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 30;
}

.library-collab-chip {
  position: absolute;
  left: 0.6rem;
  top: 0.6rem;
}

.library-list-thumb {
  width: 140px;
  height: 80px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #c7c2ce;
}

.library-project-list-card .card-body {
  overflow: visible;
}

.library-project-title {
  font-size: 1.35rem;
  line-height: 1.3;
  font-weight: 700;
}

.library-project-tag {
  font-size: 0.9rem;
  font-weight: 500;
}

.library-project-time {
  font-size: 1rem;
  font-weight: 500;
}

.library-min-width-0 {
  min-width: 0;
}

@media (max-width: 767px) {
  .library-list-thumb {
    width: 96px;
    height: 60px;
  }
}
</style>
