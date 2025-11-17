<script setup>
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded bg-primary-600" />
          <div class="text-sm font-semibold text-slate-800">Poster Designer – SDK Test</div>
        </div>
        <nav class="flex gap-2 text-sm">
          <RouterLink
            to="/ce-test"
            class="rounded-lg px-3 py-1.5"
            active-class="bg-primary-600 text-white"
          >
            CE-Test
          </RouterLink>
          <RouterLink
            to="/polotno-test"
            class="rounded-lg px-3 py-1.5"
            active-class="bg-primary-600 text-white"
          >
            Polotno-Test
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
