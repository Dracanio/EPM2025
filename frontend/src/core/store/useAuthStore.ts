import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

export const useAuthStore = defineStore('auth', () => {
    
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role)

  // Actions
  function login(email: string) {
    // MOCK LOGIN LOGIC
    // In production, this would call an API
    
    // Simulate API delay
    setTimeout(() => {
        token.value = 'mock-jwt-token-' + Date.now()
        user.value = {
            id: 'u-123',
            name: 'Test Artist',
            email: email,
            role: 'editor' // Default role for mock
        }
    }, 100)
    
    return Promise.resolve()
  }

  function logout() {
    user.value = null
    token.value = null
    // Router push should be handled by comp or here if router instance available
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    logout
  }
})
