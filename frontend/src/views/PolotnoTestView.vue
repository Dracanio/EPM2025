<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { PolotnoApp } from '../polotno/PolotnoApp.jsx'

const rootEl = ref(null)
const error = ref('')
let root = null

onMounted(() => {
  if (rootEl.value) {
    root = ReactDOM.createRoot(rootEl.value)
    root.render(React.createElement(PolotnoApp))
  }
})

onBeforeUnmount(() => {
  if (root) {
    root.unmount()
  }
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6 w-full">
    <section class="space-y-4">
      <h1 class="text-xl font-semibold text-slate-900">Polotno-SDK Test</h1>
      <p class="text-sm text-slate-600">Polotno-Editor </p>

      <div>
        <div
          ref="rootEl"
          class="h-[720px] w-full rounded-2xl border border-slate-300 bg-white"
        />
        <p v-if="error" class="mt-3 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
          {{ error }}
        </p>
      </div>
    </section>
  </div>
</template>

