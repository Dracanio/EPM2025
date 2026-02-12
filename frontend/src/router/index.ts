import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/core/store/useAuthStore'
import LoginPage from '@/modules/auth/LoginPage.vue'
import TemplateLibraryPage from '@/modules/library/TemplateLibraryPage.vue'
import EditorPage from '@/modules/editor/EditorPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/templates',
      name: 'templates',
      component: TemplateLibraryPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/editor/:posterId',
      name: 'editor',
      component: EditorPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/print/:posterId',
      name: 'print',
      component: () => import('@/modules/editor/EditorPage.vue'), // Placeholder
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
