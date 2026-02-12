<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '@/core/store/useAuthStore'

type AuthMode = 'login' | 'register'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mode = ref<AuthMode>('login')
const name = ref('')
const email = ref('admin@th-koeln.de')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const authError = ref('')

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) return redirect
  return '/templates'
})

function switchMode(nextMode: AuthMode) {
  mode.value = nextMode
  authError.value = ''
}

async function handleSubmit() {
  if (!email.value || !password.value) return
  if (mode.value === 'register' && !name.value.trim()) {
    authError.value = 'Bitte einen Namen eingeben.'
    return
  }
  if (mode.value === 'register' && password.value !== confirmPassword.value) {
    authError.value = 'Passwoerter stimmen nicht ueberein.'
    return
  }

  isLoading.value = true
  authError.value = ''
  try {
    if (mode.value === 'register') {
      await authStore.register(name.value.trim(), email.value.trim().toLowerCase(), password.value)
    } else {
      await authStore.login(email.value.trim().toLowerCase(), password.value)
    }
    router.push(redirectTarget.value)
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'Authentifizierung fehlgeschlagen.'
  } finally {
    isLoading.value = false
  }
}

function continueAsGuest() {
  authStore.continueAsGuest()
  router.push('/templates')
}
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3">
    <div class="card shadow-sm w-100 auth-card">
      <div class="card-body p-4 p-md-5">
        <h1 class="h3 text-center mb-1">Poster Designer</h1>
        <p class="text-secondary text-center mb-4">
          {{ mode === 'login' ? 'Melde dich an, um Projekte zu verwalten.' : 'Erstelle einen Account fuer Team-Features.' }}
        </p>

        <div class="btn-group w-100 mb-3">
          <button type="button" class="btn" :class="mode === 'login' ? 'btn-primary' : 'btn-outline-secondary'" @click="switchMode('login')">
            Login
          </button>
          <button
            type="button"
            class="btn d-inline-flex align-items-center justify-content-center gap-1"
            :class="mode === 'register' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="switchMode('register')"
          >
            <UserPlus :size="14" />
            Account erstellen
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="vstack gap-3">
          <div v-if="mode === 'register'">
            <label for="name" class="form-label">Name</label>
            <input id="name" v-model="name" type="text" class="form-control" autocomplete="name" required />
          </div>

          <div>
            <label for="email" class="form-label">E-Mail</label>
            <input id="email" v-model="email" type="email" class="form-control" autocomplete="email" required />
          </div>

          <div>
            <label for="password" class="form-label">Passwort</label>
            <input id="password" v-model="password" type="password" class="form-control" placeholder="******" autocomplete="current-password" required />
          </div>

          <div v-if="mode === 'register'">
            <label for="confirmPassword" class="form-label">Passwort wiederholen</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-control"
              placeholder="******"
              autocomplete="new-password"
              required
            />
          </div>

          <p v-if="authError" class="small text-danger mb-0">{{ authError }}</p>

          <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
            <span v-if="isLoading">Bitte warten...</span>
            <span v-else>{{ mode === 'login' ? 'Einloggen' : 'Account anlegen' }}</span>
          </button>
        </form>

        <div class="border-top mt-4 pt-3">
          <button type="button" class="btn btn-outline-secondary w-100" @click="continueAsGuest">
            Als Gast fortfahren
          </button>
          <p class="small text-secondary mb-0 mt-2 text-center">Gastmodus zeigt nur Vorlagen und keine gespeicherten Projekte.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-card {
  max-width: 480px;
}
</style>

