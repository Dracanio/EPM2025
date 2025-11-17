<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import CreativeEditorSDK from '@cesdk/cesdk-js'

const container = ref(null)
const error = ref('')
let instance = null

onMounted(async () => {
  const license = import.meta.env.VITE_CESDK_LICENSE || ''
  if (!license) {
    error.value =
      'Bitte einen kostenlosen CE-Lizenz-String im Account holen und als VITE_CESDK_LICENSE in .env eintragen.'
    return
  }

  try {
    instance = await CreativeEditorSDK.create(container.value, {
      license,
      ui: {
        theme: 'light',
      },
    })
    // einfache leere Szene anlegen, sonst bleibt der Editor ohne Inhalt
    if (typeof instance.createDesignScene === 'function') {
      await instance.createDesignScene()
    }
  } catch (e) {
    console.error(e)
    error.value = 'CE-SDK konnte mit der Lizenz nicht geladen werden. Details in der Konsole.'
  }
})

onBeforeUnmount(() => {
  if (instance && typeof instance.dispose === 'function') {
    instance.dispose()
  }
})
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-xl font-semibold text-slate-900">CE-SDK Test</h1>
    <p class="text-sm text-slate-600">CE-Editor </p>

    <div>
      <div
        ref="container"
        class="h-[720px] w-full rounded-2xl border border-slate-300 bg-white"
      />
      <p v-if="error" class="mt-3 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
        {{ error }}
      </p>
    </div>
  </section>
</template>

