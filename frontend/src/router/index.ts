import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/core/store/useAuthStore'
import { useProjectAccessStore } from '@/core/store/useProjectAccessStore'
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
      meta: { allowGuest: true }
    },
    {
      path: '/projects',
      name: 'projects',
      component: TemplateLibraryPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/editor/:posterId',
      name: 'editor',
      component: EditorPage,
      meta: { allowGuest: true }
    },
    {
      path: '/shared/:token',
      name: 'shared-editor',
      component: EditorPage,
      meta: { allowAnonymous: true, isSharedLink: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/modules/profile/ProfilePage.vue'),
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
  const accessStore = useProjectAccessStore()

  if (to.meta.isSharedLink) {
    const token = typeof to.params.token === 'string' ? to.params.token : ''
    const access = accessStore.findAccessByToken(token)
    if (!access) {
      authStore.setAnonymous()
      next('/login')
      return
    }
    authStore.enterLinkSession({
      token,
      role: access.role,
      projectId: access.projectId
    })
    next()
    return
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
    return
  }

  if (to.meta.allowGuest && authStore.sessionMode === 'anonymous') {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
    return
  }

  next()
})

export default router
