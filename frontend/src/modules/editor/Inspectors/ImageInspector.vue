<template>
  <div class="vstack gap-3">
    <div class="border rounded p-3 bg-light">
      <p class="small text-secondary mb-2">Image Asset</p>
      <div class="border rounded bg-white d-flex align-items-center justify-content-center mb-2" style="height: 128px;">
        <img v-if="element.src" :src="element.src" class="img-fluid" style="max-height: 112px;" />
        <span v-else class="small text-secondary">Preview</span>
      </div>

      <button type="button" class="btn btn-outline-secondary btn-sm w-100" @click="triggerUpload">
        <span class="d-inline-flex align-items-center gap-2">
          <Upload :size="14" />
          Bild aendern
        </span>
      </button>
      <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="handleUpload" />
    </div>

    <div>
      <label class="inspector-label">Fit</label>
      <select v-model="localFit" class="form-select form-select-sm" @change="update">
        <option value="contain">Contain</option>
        <option value="cover">Cover</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ImageElement } from '@/core/models/element'
import { useEditorStore } from '@/core/store/useEditorStore'
import { Upload } from 'lucide-vue-next'

const props = defineProps<{
  element: ImageElement
}>()

const store = useEditorStore()
const localFit = ref(props.element.fit)
const fileInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.element,
  (newVal) => {
    localFit.value = newVal.fit
  }
)

function update() {
  store.updateElement(props.element.id, {
    fit: localFit.value
  })
}

function triggerUpload() {
  fileInput.value?.click()
}

function handleUpload(event: Event) {
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
