<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function selectTemplate(id: string) {
  router.push(`/editor/${id}`)
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-6">Vorlagen wählen</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <!-- Mock Templates -->
      <div v-for="i in 4" :key="i" 
           class="border rounded-lg p-4 hover:shadow-lg cursor-pointer transition bg-white"
           @click="selectTemplate('new-' + i)">
        <div class="aspect-[1/1.414] bg-gray-200 mb-4 flex items-center justify-center">
          <span class="text-gray-400">A4 Vorschau {{ i }}</span>
        </div>
        <h3 class="font-bold">TH Köln Standard {{ i }}</h3>
      </div>
    </div>
  </div>
</template>
