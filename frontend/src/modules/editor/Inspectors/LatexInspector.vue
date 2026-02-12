<template>
  <div class="vstack gap-3">
    <div>
      <label class="inspector-label d-inline-flex align-items-center gap-1">
        Formel (LaTeX)
        <Lock v-if="!canEditTextContent" :size="12" />
      </label>
      <textarea
        v-model="localLatex"
        rows="4"
        class="form-control form-control-sm latex-input"
        :disabled="!canEditTextContent"
        @input="update"
      ></textarea>
      <p class="small text-secondary mt-1 mb-0">Beispiel: <code>\\frac{a}{b}</code>, <code>\\int_0^1 x^2 dx</code></p>
      <p v-if="!canEditTextContent" class="small text-secondary mt-2 mb-0 d-inline-flex align-items-center gap-1">
        <Lock :size="12" />
        Formeln sind fuer deine Rolle gesperrt.
      </p>
    </div>

    <div class="border rounded p-2 bg-light">
      <div class="small text-secondary mb-1">Vorschau (Textmodus)</div>
      <code class="latex-preview">$ {{ localLatex }} $</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { LatexElement } from '@/core/models/element'
import { useEditorStore } from '@/core/store/useEditorStore'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'
import type { ProjectRole } from '@/core/models/accessControl'
import { Lock } from 'lucide-vue-next'

const props = defineProps<{
  element: LatexElement
}>()

const store = useEditorStore()
const authStore = useAuthStore()
const accessStore = useProjectAccessStore()

const localLatex = ref(props.element.latex)

const activeProjectId = computed(() => store.activePoster?.id || '')
const currentProjectRole = computed<ProjectRole>(() => {
  if (authStore.isLinkSession) return authStore.linkSession?.role || 'viewer'
  const resolved = accessStore.resolveProjectRole(activeProjectId.value, authStore.user?.id, authStore.user?.email)
  return resolved || 'owner'
})

const canEditTextContent = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'editTextContent')
})

watch(
  () => props.element,
  (nextValue) => {
    localLatex.value = nextValue.latex
  },
  { deep: true }
)

function update() {
  if (!canEditTextContent.value) return
  store.updateElement(props.element.id, {
    latex: localLatex.value
  })
}
</script>

<style scoped>
.latex-input,
.latex-preview {
  font-family: Monaco, Menlo, Consolas, monospace;
}

.latex-preview {
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
