<script setup lang="ts">
import { computed } from 'vue'
import type {
  EditorPermissionCategory,
  EditorPermissionDefinition,
  EditorPermissionKey,
  EditorPermissionState
} from '@/core/models/accessControl'

const props = defineProps<{
  permissions: EditorPermissionState
  definitions: EditorPermissionDefinition[]
}>()

const emit = defineEmits<{
  (e: 'toggle', payload: { permissionKey: EditorPermissionKey; enabled: boolean }): void
}>()

const categoryLabels: Record<EditorPermissionCategory, string> = {
  content: 'Inhalt & Design',
  assets: 'Assets & Elemente',
  project: 'Projektsteuerung'
}

const groupedDefinitions = computed(() => {
  return (Object.keys(categoryLabels) as EditorPermissionCategory[]).map((category) => ({
    category,
    label: categoryLabels[category],
    items: props.definitions.filter((entry) => entry.category === category)
  }))
})

function onToggle(permissionKey: EditorPermissionKey, event: Event) {
  const enabled = (event.target as HTMLInputElement).checked
  emit('toggle', { permissionKey, enabled })
}
</script>

<template>
  <section class="settings-card border rounded-4 p-3">
    <header class="mb-3">
      <h3 class="settings-title mb-1">Editor Berechtigungen</h3>
      <p class="text-secondary mb-0">Steuert, welche Aktionen fuer die Rolle "Editor" erlaubt sind.</p>
    </header>

    <div class="vstack gap-3">
      <div v-for="group in groupedDefinitions" :key="group.category" class="permission-group border rounded-3 overflow-hidden">
        <div class="permission-group-title">
          {{ group.label }}
        </div>

        <div class="vstack">
          <label v-for="permission in group.items" :key="permission.key" class="permission-row">
            <div>
              <p class="permission-row-title mb-0">{{ permission.title }}</p>
              <p class="permission-row-description mb-0">{{ permission.description }}</p>
            </div>

            <div class="form-check form-switch permission-switch">
              <input
                class="form-check-input"
                type="checkbox"
                :checked="props.permissions[permission.key]"
                @change="onToggle(permission.key, $event)"
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings-card {
  background: #ffffff;
  border-color: var(--panel-border);
}

.settings-title {
  font-size: 1rem;
  font-weight: 700;
}

.permission-group {
  border-color: var(--panel-border);
}

.permission-group-title {
  padding: 0.6rem 0.75rem;
  font-size: 0.92rem;
  font-weight: 700;
  background: #eaf1ff;
}

.permission-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-top: 1px solid var(--panel-border);
}

.permission-row:first-of-type {
  border-top: 0;
}

.permission-row-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.permission-row-description {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.permission-switch {
  margin: 0;
}

.permission-switch .form-check-input {
  width: 2.4rem;
  height: 1.35rem;
}
</style>

