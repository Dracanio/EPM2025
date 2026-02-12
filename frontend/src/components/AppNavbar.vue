<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDown, ChevronLeft, ChevronRight, House } from 'lucide-vue-next'
import { useAuthStore } from '@/core/store/useAuthStore'

type NavSection = 'templates' | 'projects' | 'editor'
type RouterHistoryState = {
  back?: string | null
  forward?: string | null
  position?: number
}

const props = withDefaults(
  defineProps<{
    activeSection: NavSection
    contextLabel?: string
  }>(),
  {
    activeSection: 'templates'
  }
)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const historyState = ref<RouterHistoryState>({})
const userMenuRef = ref<HTMLElement | null>(null)
const isUserMenuOpen = ref(false)

const userDisplayName = computed(() => authStore.user?.name?.trim() || 'Nutzer')
const userInitials = computed(() =>
  userDisplayName.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() || '')
    .join('')
)

const resolvedContextLabel = computed(() => {
  if (props.contextLabel && props.contextLabel.trim().length > 0) return props.contextLabel.trim()
  if (props.activeSection === 'editor') return 'Editor'
  if (props.activeSection === 'projects') return 'Alle Projekte'
  return 'Startseite'
})

const canGoBack = computed(() => Boolean(historyState.value.back) || (historyState.value.position ?? 0) > 0)
const canGoForward = computed(() => Boolean(historyState.value.forward))

function syncHistoryState() {
  historyState.value = (window.history.state as RouterHistoryState | null) || {}
}

function goHome() {
  if (route.path === '/templates') return
  router.push('/templates')
}

function goBack() {
  if (!canGoBack.value) {
    goHome()
    return
  }
  router.back()
}

function goForward() {
  if (!canGoForward.value) return
  router.forward()
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeUserMenu() {
  isUserMenuOpen.value = false
}

function onGlobalPointerDown(event: PointerEvent) {
  const target = event.target as Node | null
  if (!target || !userMenuRef.value) return
  if (!userMenuRef.value.contains(target)) {
    closeUserMenu()
  }
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeUserMenu()
  }
}

function logout() {
  closeUserMenu()
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  syncHistoryState()
  document.addEventListener('pointerdown', onGlobalPointerDown)
  document.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onGlobalPointerDown)
  document.removeEventListener('keydown', onGlobalKeydown)
})

watch(
  () => route.fullPath,
  () => {
    syncHistoryState()
    closeUserMenu()
  }
)
</script>

<template>
  <header class="app-navbar border-bottom">
    <div class="container-fluid px-3 px-lg-4">
      <div class="app-navbar-row">
        <div class="d-flex align-items-center gap-2 gap-lg-3 flex-wrap">
          <button type="button" class="btn p-0 d-inline-flex align-items-center gap-2 border-0 app-navbar-brand-btn" @click="goHome">
            <span class="app-navbar-logo">P</span>
            <span class="app-navbar-brand">Poster Designer</span>
          </button>

          <nav class="d-flex align-items-center gap-2">
            <div class="app-navbar-history d-inline-flex align-items-center">
              <button type="button" class="btn app-navbar-icon-btn" :disabled="!canGoBack" @click="goBack" aria-label="Zurueck">
                <ChevronLeft :size="16" />
              </button>
              <button type="button" class="btn app-navbar-icon-btn" :disabled="!canGoForward" @click="goForward" aria-label="Vorwaerts">
                <ChevronRight :size="16" />
              </button>
            </div>

            <button
              type="button"
              class="btn app-navbar-home-btn"
              :class="{ 'is-active': props.activeSection === 'templates' }"
              @click="goHome"
            >
              <House :size="14" />
              Startseite
            </button>
          </nav>
        </div>

        <div class="d-flex align-items-center gap-2">
          <slot name="actions" />
          <span class="app-navbar-context-chip" :class="`is-${props.activeSection}`">{{ resolvedContextLabel }}</span>

          <div ref="userMenuRef" class="app-navbar-user" @click.stop>
            <button
              type="button"
              class="btn btn-light border app-navbar-user-trigger"
              :aria-expanded="isUserMenuOpen"
              aria-haspopup="menu"
              @click.stop="toggleUserMenu"
            >
              <span class="app-navbar-avatar">{{ userInitials }}</span>
              <ChevronDown :size="16" />
            </button>
            <div v-if="isUserMenuOpen" class="card app-navbar-user-panel shadow-sm" role="menu">
              <div class="card-body p-3">
                <p class="fw-semibold mb-1">{{ userDisplayName }}</p>
                <p class="small text-secondary mb-3">{{ authStore.user?.email || 'Nicht angemeldet' }}</p>
                <button type="button" class="btn btn-outline-secondary btn-sm w-100" @click="logout">
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(6px);
}

.app-navbar-row {
  min-height: var(--app-navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-block: 0.55rem;
  flex-wrap: wrap;
}

.app-navbar-brand-btn {
  border-radius: 0.7rem;
  padding: 0.15rem 0.25rem;
}

.app-navbar-brand-btn:focus-visible {
  outline: 2px solid var(--color-brand-violet);
  outline-offset: 2px;
}

.app-navbar-logo {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--color-brand-primary), var(--color-brand-indigo));
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
}

.app-navbar-brand {
  font-size: 1.3rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--color-ink-strong);
}

.app-navbar-history {
  border: 1px solid var(--color-border-strong);
  border-radius: 0.65rem;
  background: var(--color-surface-muted);
  overflow: hidden;
}

.app-navbar-icon-btn {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink-strong);
}

.app-navbar-icon-btn + .app-navbar-icon-btn {
  border-left: 1px solid var(--color-border-strong);
}

.app-navbar-icon-btn:disabled {
  color: var(--color-gray-500);
  background: var(--color-gray-100);
}

.app-navbar-home-btn {
  height: 34px;
  border: 1px solid var(--color-border-strong);
  background: #ffffff;
  color: #4a4457;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.app-navbar-home-btn.is-active {
  border-color: var(--color-brand-indigo);
  background: rgba(89, 82, 225, 0.1);
  color: var(--color-brand-indigo);
}

.app-navbar-context-chip {
  height: 34px;
  border-radius: 999px;
  padding-inline: 0.8rem;
  display: inline-flex;
  align-items: center;
  border: 1px solid transparent;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.app-navbar-context-chip.is-templates {
  background: rgba(221, 17, 102, 0.12);
  border-color: rgba(221, 17, 102, 0.32);
  color: var(--color-brand-primary);
}

.app-navbar-context-chip.is-projects {
  background: rgba(89, 82, 225, 0.12);
  border-color: rgba(89, 82, 225, 0.28);
  color: var(--color-brand-indigo);
}

.app-navbar-context-chip.is-editor {
  background: var(--color-ink-strong);
  border-color: var(--color-ink-strong);
  color: #ffffff;
}

.app-navbar-user {
  position: relative;
}

.app-navbar-user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.2rem 0.5rem 0.2rem 0.3rem;
  height: 34px;
  border-radius: 999px;
  background: #ffffff;
  border-color: var(--color-border-strong);
}

.app-navbar-avatar {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: rgba(147, 19, 206, 0.12);
  color: #562580;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.app-navbar-user-panel {
  position: absolute;
  top: calc(100% + 0.45rem);
  right: 0;
  width: 14rem;
  z-index: 140;
  border: 1px solid var(--color-border-subtle);
}

@media (max-width: 991px) {
  .app-navbar-brand {
    font-size: 1.15rem;
  }
}

@media (max-width: 767px) {
  .app-navbar-row {
    padding-block: 0.45rem;
  }

  .app-navbar-brand {
    font-size: 1rem;
  }

  .app-navbar-context-chip {
    display: none;
  }
}
</style>
