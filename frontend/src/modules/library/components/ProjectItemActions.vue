<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Copy, MoreHorizontal, Trash2 } from 'lucide-vue-next'

type ActionTone = 'default' | 'danger'

interface ActionItem {
  id: string
  label: string
  tone?: ActionTone
}

const props = withDefaults(
  defineProps<{
    actions?: ActionItem[]
  }>(),
  {
    actions: () => [
      { id: 'duplicate', label: 'Duplizieren', tone: 'default' },
      { id: 'delete', label: 'Löschen', tone: 'danger' }
    ]
  }
)

const emit = defineEmits<{
  (e: 'select', actionId: string): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function selectAction(actionId: string) {
  emit('select', actionId)
  isOpen.value = false
}

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function iconForAction(actionId: string) {
  if (actionId === 'delete') return Trash2
  if (actionId === 'duplicate') return Copy
  return MoreHorizontal
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node | null
  if (!target || !rootRef.value) return
  if (!rootRef.value.contains(target)) {
    isOpen.value = false
  }
}

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <div ref="rootRef" class="project-actions" @click.stop>
    <button type="button" class="project-actions-trigger btn btn-light" @click.stop="toggleMenu">
      <MoreHorizontal :size="16" />
    </button>

    <div v-if="isOpen" class="project-actions-menu card shadow-sm">
      <button
        v-for="item in props.actions"
        :key="item.id"
        type="button"
        class="btn btn-sm text-start rounded-0 project-actions-item"
        :class="item.tone === 'danger' ? 'text-danger' : 'text-body'"
        @click.stop="selectAction(item.id)"
      >
        <component :is="iconForAction(item.id)" :size="14" class="project-actions-icon" />
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.project-actions {
  position: relative;
  z-index: 40;
}

.project-actions-trigger {
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4a4560;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--color-border-strong);
  border-radius: 0.72rem;
  box-shadow: 0 0.3rem 0.8rem rgba(20, 24, 35, 0.08);
}

.project-actions-trigger:hover {
  color: var(--color-brand-indigo);
  background: #ffffff;
  border-color: var(--color-brand-indigo);
}

.project-actions-menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  min-width: 10.25rem;
  padding: 0.3rem;
  z-index: 220;
  border: 1px solid var(--color-border-strong);
  border-radius: 0.8rem;
}

.project-actions-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 0.6rem;
  border-radius: 0.55rem;
}

.project-actions-icon {
  flex-shrink: 0;
  opacity: 0.9;
}

.project-actions-item:hover {
  background: rgba(89, 82, 225, 0.11);
}
</style>
