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
      'lizenz fehlt'
    return
  }

  try {
    //die magie faengt hier an
    instance = await CreativeEditorSDK.create(container.value, {
      license,
      ui: {
        theme: 'light',
      },
    })
    if (typeof instance.createDesignScene === 'function') {
      await instance.createDesignScene()
    }
  } catch (e) {
    console.error(e)
    error.value = 'CE-SDK konnte mit der Lizenz nicht geladen werden.'
  }
})

onBeforeUnmount(() => {
  if (instance && typeof instance.dispose === 'function') {
    instance.dispose()
  }
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6 w-full">
    <section class="space-y-4">
      <h1 class="text-xl font-semibold text-slate-900">CE.SDK Test</h1>
      <p class="text-sm text-slate-600">CreativeEditor SDK Integration</p>

      <div>
        <div
          ref="container"
          class="h-[720px] w-full rounded-2xl border border-slate-300 bg-white shadow-sm"
        ></div>
        <p v-if="error" class="mt-3 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
          {{ error }}
        </p>
      </div>
    </section>
  </div>
</template>

