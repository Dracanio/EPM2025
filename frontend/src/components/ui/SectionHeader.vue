<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="app-frame-header d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-2">
    <div>
      <h1 class="h2 mb-1">{{ title }}</h1>
      <p v-if="subtitle" class="text-secondary mb-0">{{ subtitle }}</p>
    </div>
    <div>
      <slot name="actions" />
    </div>
  </div>
</template>
