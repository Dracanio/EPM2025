<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { PosterDesignerApp } from '../polotno/PosterDesignerApp.jsx'

const rootEl = ref(null)
let root = null

onMounted(() => {
  if (rootEl.value) {
    root = ReactDOM.createRoot(rootEl.value)
    root.render(React.createElement(PosterDesignerApp))
  }
})

onBeforeUnmount(() => {
  if (root) {
    root.unmount()
  }
})
</script>

<template>
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #f3f4f6;">
    <!-- The React App will take up the full container -->
    <div ref="rootEl" style="width: 100%; height: 100%;" />
  </div>
</template>

<style>
/* Ensure Polotno styles don't conflict too much, though it's isolated in React usually */
</style>
