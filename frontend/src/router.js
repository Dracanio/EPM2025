import { createRouter, createWebHistory } from 'vue-router'
import CeTestView from './views/CeTestView.vue'
import PolotnoTestView from './views/PolotnoTestView.vue'

const routes = [
  { path: '/', redirect: '/ce-test' },
  { path: '/ce-test', component: CeTestView },
  { path: '/polotno-test', component: PolotnoTestView },
  { path: '/poster-designer', component: () => import('./views/PosterDesignerView.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})


