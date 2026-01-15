<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/store/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()
</script>

<template>
  <aside class="w-[300px] bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
    <div class="p-4 border-b border-gray-100">
      <h1 class="font-bold text-red-600 flex items-center gap-2">
        <span>Poster Editor</span>
      </h1>
    </div>
    
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Tools Placeholder -->
      <div class="space-y-2">
        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</label>
        <button class="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-left">
          <span>T</span> Add Text
        </button>
        <button class="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm transition text-left">
          <span>🖼️</span> Add Image
        </button>
      </div>
      
      <!-- Properties Placeholder -->
       <div class="space-y-2">
         <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Properties</label>
         <p class="text-sm text-gray-400 italic">No selection</p>
       </div>
    </div>
    
    <div class="p-4 border-t border-gray-100 space-y-2">
      <button class="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition">
        Export / Print
      </button>
      <button @click="authStore.logout(); router.push('/login')" class="w-full py-2 bg-white text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition text-sm">
        Logout
      </button>
    </div>
  </aside>
</template>
