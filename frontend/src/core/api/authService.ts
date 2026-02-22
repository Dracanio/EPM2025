import { api } from './apiClient.ts'

export interface LoginResponse {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
}

export const authService = {
    async login(email: string, password: string) {
        const { data } = await api.post<LoginResponse>('/login', {
            email,
            password
        })
        return data
    },

    async register(firstName: string, lastName: string, email: string, password: string) {
        const { data } = await api.post<LoginResponse>('/register', {
            firstName,
            lastName,
            email,
            password
        })
        return data
    }
}