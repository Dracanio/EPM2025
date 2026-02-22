import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ShareLinkRole } from '@/core/models/accessControl'
import { authService } from '@/core/api/authService'

type SessionMode = 'anonymous' | 'authenticated' | 'guest' | 'link'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  avatarUrl?: string
}

interface LinkSession {
  token: string
  role: ShareLinkRole
  projectId: string
}

interface StoredSession {
  sessionMode: SessionMode
  token: string | null
  user: User | null
  linkSession: LinkSession | null
}

const AUTH_STORAGE_KEY = 'poster_designer_auth_session_v1'

function readStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    const sessionMode = parsed.sessionMode
    const validSessionMode =
      sessionMode === 'anonymous' || sessionMode === 'authenticated' || sessionMode === 'guest' || sessionMode === 'link'
    if (!validSessionMode) return null

    return {
      sessionMode,
      token: typeof parsed.token === 'string' ? parsed.token : null,
      user: parsed.user && typeof parsed.user === 'object' ? (parsed.user as User) : null,
      linkSession:
        parsed.linkSession && typeof parsed.linkSession === 'object'
          ? (parsed.linkSession as LinkSession)
          : null
    }
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = readStoredSession()

  const user = ref<User | null>(stored?.user || null)
  const token = ref<string | null>(stored?.token || null)
  const sessionMode = ref<SessionMode>(stored?.sessionMode || 'anonymous')
  const linkSession = ref<LinkSession | null>(stored?.linkSession || null)

  const isAuthenticated = computed(() => sessionMode.value === 'authenticated' && !!token.value)
  const isGuest = computed(() => sessionMode.value === 'guest')
  const isLinkSession = computed(() => sessionMode.value === 'link' && !!linkSession.value)
  const userRole = computed(() => user.value?.role)
  const canAccessLibrary = computed(() => isAuthenticated.value || isGuest.value)
  const showProfileMenu = computed(() => isAuthenticated.value)

  function persist() {
    if (typeof window === 'undefined') return
    const snapshot: StoredSession = {
      sessionMode: sessionMode.value,
      token: token.value,
      user: user.value,
      linkSession: linkSession.value
    }
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot))
  }

  function setAnonymous() {
    sessionMode.value = 'anonymous'
    token.value = null
    user.value = null
    linkSession.value = null
    persist()
  }

  function continueAsGuest() {
    sessionMode.value = 'guest'
    token.value = null
    user.value = null
    linkSession.value = null
    persist()
  }

  function enterLinkSession(payload: LinkSession) {
    sessionMode.value = 'link'
    token.value = null
    user.value = null
    linkSession.value = payload
    persist()
  }

  function clearLinkSession() {
    if (sessionMode.value !== 'link') return
    setAnonymous()
  }

  async function login(email: string, password?: string) {
    if (!email || !password) return Promise.reject(new Error('Email and password are required'))

    try {
      const res = await authService.login(email, password)

      user.value = {
        id: res.id,
        name: `${res.firstName} ${res.lastName}`,
        email: res.email,
        role: 'editor'
      }

      token.value = null // kein JWT aktuell
      sessionMode.value = 'authenticated'
      linkSession.value = null
      persist()
    } catch (e) {
      throw new Error('Login fehlgeschlagen')
    }
  }

  async function register(name: string, email: string, password: string) {
    if (!name || !email || !password) return Promise.reject(new Error('Missing registration fields'))

    const parts = name.trim().split(' ')
    const firstName = parts[0]!
    const lastName = parts.slice(1).join(' ') || '-'

    try {
      const res = await authService.register(firstName, lastName, email, password)

      user.value = {
        id: res.id,
        name: `${res.firstName} ${res.lastName}`,
        email: res.email,
        role: 'editor'
      }

      token.value = null
      sessionMode.value = 'authenticated'
      linkSession.value = null
      persist()
    } catch (e) {
      throw new Error('Registrierung fehlgeschlagen')
    }
  }

  function updateProfile(partial: Partial<Pick<User, 'name' | 'email' | 'avatarUrl'>>) {
    if (!user.value) return
    user.value = {
      ...user.value,
      ...partial
    }
    persist()
  }

  function logout() {
    setAnonymous()
  }

  return {
    user,
    token,
    sessionMode,
    linkSession,
    isAuthenticated,
    isGuest,
    isLinkSession,
    userRole,
    canAccessLibrary,
    showProfileMenu,
    login,
    register,
    continueAsGuest,
    enterLinkSession,
    clearLinkSession,
    updateProfile,
    setAnonymous,
    logout
  }
})

