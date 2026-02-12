<template>
  <div class="vstack gap-3">
    <div class="border rounded p-3 bg-light">
      <p class="small text-secondary mb-2">Image Asset</p>
      <div class="border rounded bg-white d-flex align-items-center justify-content-center mb-2" style="height: 128px;">
        <img v-if="element.src" :src="element.src" class="img-fluid" style="max-height: 112px;" />
        <span v-else class="small text-secondary">Preview</span>
      </div>

      <button type="button" class="btn btn-outline-secondary btn-sm w-100" :disabled="!canUploadAssets" @click="triggerUpload">
        <span class="d-inline-flex align-items-center gap-2">
          <Upload v-if="canUploadAssets" :size="14" />
          <Lock v-else :size="13" />
          Bild aendern
        </span>
      </button>
      <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleUpload" />
      <p v-if="!canUploadAssets" class="small text-secondary mt-2 mb-0 d-inline-flex align-items-center gap-1">
        <Lock :size="12" />
        Uploads sind fuer deine Rolle gesperrt.
      </p>
    </div>

    <div>
      <label class="inspector-label d-inline-flex align-items-center gap-1">
        Fit
        <Lock v-if="!canEditFit" :size="12" />
      </label>
      <select v-model="localFit" class="form-select form-select-sm" :disabled="!canEditFit" @change="update">
        <option value="contain">Contain</option>
        <option value="cover">Cover</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ImageElement } from '@/core/models/element'
import { useEditorStore } from '@/core/store/useEditorStore'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'
import type { ProjectRole } from '@/core/models/accessControl'
import { Lock, Upload } from 'lucide-vue-next'

const props = defineProps<{
  element: ImageElement
}>()

const store = useEditorStore()
const authStore = useAuthStore()
const accessStore = useProjectAccessStore()
const localFit = ref(props.element.fit)
const fileInput = ref<HTMLInputElement | null>(null)

const activeProjectId = computed(() => store.activePoster?.id || '')
const currentProjectRole = computed<ProjectRole>(() => {
  if (authStore.isLinkSession) return authStore.linkSession?.role || 'viewer'
  const resolved = accessStore.resolveProjectRole(activeProjectId.value, authStore.user?.id, authStore.user?.email)
  return resolved || 'owner'
})

const canUploadAssets = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'uploadOwnAssets')
})

const canEditFit = computed(() => {
  if (!activeProjectId.value) return true
  return accessStore.canRolePerform(activeProjectId.value, currentProjectRole.value, 'moveAndResizeElements')
})

watch(
  () => props.element,
  (newVal) => {
    localFit.value = newVal.fit
  }
)

function update() {
  if (!canEditFit.value) return
  store.updateElement(props.element.id, {
    fit: localFit.value
  })
}

function triggerUpload() {
  if (!canUploadAssets.value) return
  fileInput.value?.click()
}

function handleUpload(event: Event) {
  if (!canUploadAssets.value) return
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      store.updateElement(props.element.id, {
        src,
        assetId: 'upload-replacement'
      })
    }
    reader.readAsDataURL(file)
    target.value = ''
  }
}
</script>
