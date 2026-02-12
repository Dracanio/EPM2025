<script setup lang="ts">
const props = withDefaults(defineProps<{ wide?: boolean }>(), {
  wide: false
})
</script>

<template>
  <div class="app-page py-4 py-md-5">
    <div :class="props.wide ? 'container-fluid px-3 px-md-4' : 'container'">
      <slot />
    </div>
  </div>
</template>
