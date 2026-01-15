<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useEditorStore } from '@/core/store/useEditorStore'
import type { TextElement, ImageElement } from '@/core/models/element'
import InspectorPanel from './Inspectors/InspectorPanel.vue'
import { ref } from 'vue'
import { Type, Image, Heading1 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const editorStore = useEditorStore()

function addTitle() {
  const newTitle: TextElement = {
    id: crypto.randomUUID(),
    type: 'text',
    name: 'Title Layer',
    xMm: 20,
    yMm: 50,
    widthMm: 170,
    heightMm: 30,
    rotationDeg: 0,
    locked: false,
    text: 'Neuer Titel',
    variant: 'title',
    align: 'center',
    fontSize: 48,
    fontFamily: 'Arial',
    color: '#000000',
    fontWeight: 'bold',
    fontStyle: 'normal',
    backgroundColor: 'transparent'
  }
  editorStore.addElement(newTitle)
}

function addText() {
  const newText: TextElement = {
    id: crypto.randomUUID(),
    type: 'text',
    name: 'Text Layer',
    xMm: 20,
    yMm: 100,
    widthMm: 100,
    heightMm: 20,
    rotationDeg: 0,
    locked: false,
    text: 'Neuer Text',
    variant: 'body',
    align: 'left',
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    backgroundColor: 'transparent'
  }
  editorStore.addElement(newText)
}

const fileInput = ref<HTMLInputElement | null>(null);

function triggerImageUpload() {
  fileInput.value?.click();
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const newImage: ImageElement = {
        id: crypto.randomUUID(),
        type: 'image',
        name: 'Image Layer',
        xMm: 50,
        yMm: 50,
        widthMm: 100,
        heightMm: 70, // Default aspect, maybe adjust later based on image
        rotationDeg: 0,
        locked: false,
        assetId: 'upload',
        src: src,
        fit: 'cover'
      };
      editorStore.addElement(newImage);
    };
    reader.readAsDataURL(file);
    // Reset val
    target.value = '';
  }
}

function addImage() {
  triggerImageUpload();
}
</script>

<template>
  <aside class="w-[300px] bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
    <div class="p-4 border-b border-gray-100">
      <h1 class="font-bold text-red-600 flex items-center gap-2">
        <span>Poster Editor</span>
      </h1>
    </div>
    
    <div class="flex-1 overflow-y-auto flex flex-col">
      <!-- Tools Section -->
      <div class="p-4 space-y-2 border-b border-gray-100 flex-none">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</label>
        <button @click="addTitle" class="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-left group">
          <Heading1 :size="18" class="text-gray-500 group-hover:text-red-600 transition" /> 
          <span>Add Title</span>
        </button>
        <button @click="addText" class="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-left group">
          <Type :size="18" class="text-gray-500 group-hover:text-red-600 transition" />
          <span>Add Text</span>
        </button>
        <button @click="addImage" class="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-left group">
          <Image :size="18" class="text-gray-500 group-hover:text-red-600 transition" />
          <span>Add Image</span>
        </button>
      </div>
      
      <!-- Properties Section -->
      <div class="flex-1 overflow-hidden">
        <InspectorPanel />
      </div>
    </div>
    
    <div class="p-4 border-t border-gray-100 space-y-2">
      <button class="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition mb-1">
        Export / Print
      </button>
      <button @click="authStore.logout(); router.push('/login')" class="w-full py-2 bg-white text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition text-sm">
        Logout
      </button>
    </div>
    
    <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleImageUpload" />
  </aside>
</template>
