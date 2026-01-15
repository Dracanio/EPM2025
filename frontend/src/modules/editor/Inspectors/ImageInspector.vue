<template>
  <div class="space-y-4">
    <div class="p-4 bg-gray-50 rounded border border-gray-200 text-center">
      <p class="text-sm text-gray-500 mb-2">Image Asset</p>
      <div class="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400 mb-2 overflow-hidden relative group">
        <img v-if="element.src" :src="element.src" class="max-w-full max-h-full object-contain">
        <span v-else>Preview</span>
        
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
           <!-- Overlay hint -->
        </div>
      </div>
      <button @click="triggerUpload" class="text-xs px-3 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center justify-center gap-2 w-full transition">
        <Upload :size="14" />
        Bild ändern...
      </button>
      <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleUpload" />
    </div>

    <div class="space-y-1">
      <label class="text-xs font-semibold text-gray-500 uppercase">Fit</label>
      <select 
        v-model="localFit" 
        class="w-full text-sm p-2 border border-gray-200 rounded"
        @change="update"
      >
        <option value="contain">Contain</option>
        <option value="cover">Cover</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ImageElement } from '@/core/models/element';
import { useEditorStore } from '@/core/store/useEditorStore';
import { Upload } from 'lucide-vue-next';

const props = defineProps<{
  element: ImageElement;
}>();

const store = useEditorStore();
const localFit = ref(props.element.fit);
const fileInput = ref<HTMLInputElement | null>(null);

watch(() => props.element, (newVal) => {
  localFit.value = newVal.fit;
});

function update() {
  store.updateElement(props.element.id, {
    fit: localFit.value
  });
}

function triggerUpload() {
  fileInput.value?.click();
}

function handleUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      store.updateElement(props.element.id, {
        src: src,
        assetId: 'upload-replacement'
      });
    };
    reader.readAsDataURL(file);
    target.value = '';
  }
}
</script>
