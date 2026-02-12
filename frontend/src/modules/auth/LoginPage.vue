<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/store/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@th-koeln.de')
const password = ref('')
const isLoading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) return

  isLoading.value = true
  try {
    await authStore.login(email.value)
    router.push('/templates')
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3">
    <div class="card shadow-sm w-100" style="max-width: 420px;">
      <div class="card-body p-4 p-md-5">
        <h1 class="h3 text-center mb-4">Poster Designer</h1>

        <form @submit.prevent="handleLogin" class="vstack gap-3">
          <div>
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-control"
              required
            />
          </div>

          <div>
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control"
              placeholder="******"
              required
            />
          </div>

          <button type="submit" class="btn btn-danger w-100" :disabled="isLoading">
            <span v-if="isLoading">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
