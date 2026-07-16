import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        if (typeof config.headers?.delete === 'function') {
            config.headers.delete('Content-Type')
        } else if (config.headers) {
            delete config.headers['Content-Type']
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export default api
