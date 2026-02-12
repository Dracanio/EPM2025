<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { MoreVertical } from 'lucide-vue-next'

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
    <button type="button" class="project-actions-trigger btn btn-light rounded-circle" @click.stop="toggleMenu">
      <MoreVertical :size="16" />
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
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4d4660;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--color-border-strong);
  font-size: 1rem;
}

.project-actions-trigger:hover {
  color: var(--color-brand-indigo);
  background: #ffffff;
}

.project-actions-menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  min-width: 9.4rem;
  padding: 0.25rem;
  z-index: 220;
  border: 1px solid var(--color-border-subtle);
}

.project-actions-item {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.45rem 0.6rem;
}

.project-actions-item:hover {
  background: rgba(89, 82, 225, 0.1);
}
</style>
