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
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Poster Designer</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" type="email" class="mt-1 block w-full rounded-md border border-gray-300 p-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input v-model="password" type="password" class="mt-1 block w-full rounded-md border border-gray-300 p-2" placeholder="******" required />
        </div>
        <button type="submit" 
                class="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition disabled:opacity-50 flex justify-center"
                :disabled="isLoading">
          <span v-if="isLoading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>
    </div>
  </div>
</template>
