<script setup lang="ts">
const props = withDefaults(defineProps<{ clickable?: boolean }>(), {
  clickable: false
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <article
    class="card section-card h-100"
    :class="{ 'section-card-clickable': props.clickable }"
    @click="handleClick"
  >
    <slot />
  </article>
</template>
