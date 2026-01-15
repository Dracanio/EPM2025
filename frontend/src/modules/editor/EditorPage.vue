<script setup lang="ts">
import { onMounted } from 'vue'
import Sidebar from './Sidebar.vue'
import PosterCanvas from './PosterCanvas.vue'
import { useEditorStore } from '@/core/store/useEditorStore'

const store = useEditorStore()

onMounted(() => {
  if (!store.activePoster) {
    store.initPoster('A4')
  }
})
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-gray-100">
    <!-- Sidebar (Fixed 300px) -->
    <Sidebar />
    
    <!-- Main Canvas Area (Flex 1) -->
    <main class="flex-1 relative flex flex-col overflow-hidden">
      <!-- Top Bar (Optional, for breadcrumbs or zoom) -->
      <header class="h-12 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
        <div class="text-sm text-gray-500">
          <router-link to="/templates" class="hover:text-red-600">Templates</router-link>
          <span class="mx-2">/</span>
          <span>Current Poster</span>
        </div>
        <div>
          <!-- Zoom controls placeholder -->
        </div>
      </header>

      <!-- Canvas Scroll Area -->
      <div class="flex-1 overflow-auto flex items-center justify-center p-8 bg-gray-100">
         <PosterCanvas />
      </div>
    </main>
  </div>
</template>
