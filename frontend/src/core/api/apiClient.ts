import axios from 'axios'
import { useAuthStore } from '@/core/store/useAuthStore'

export const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    withCredentials: true
})

api.interceptors.request.use(config => {
    const authStore = useAuthStore()
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
})