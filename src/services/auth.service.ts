import api from '@/lib/axios'
import { AuthUser } from '@/types/auth'

type LoginPayload = {
    email: string
    password: string
}

type RegisterPayload = {
    email: string
    password: string
    name: string
}

export type SetupPayload = RegisterPayload & {
    brandName: string
    logo?: File | null
}

export type SetupStatusResponse = {
    setupRequired: boolean
}

export type LoginResponse = {
    token: string
    refreshToken: string
    tokenExpires: string
    refreshTokenExpires: string
    id: string
    email: string
    name: string
}

export const AuthService = {
    login: async (data: LoginPayload): Promise<LoginResponse> => {
        const response = await api.post('/api/v1/auth/login', data)
        return response.data.data
    },

    register: async (data: RegisterPayload) => {
        const response = await api.post('/api/v1/auth/register', data)
        return response.data
    },

    getSetupStatus: async (): Promise<SetupStatusResponse> => {
        const response = await api.get('/api/v1/auth/setup/status')
        return response.data.data
    },

    setup: async (data: SetupPayload): Promise<LoginResponse> => {
        const hasLogo = !!data.logo
        const payload = hasLogo
            ? (() => {
                  const formData = new FormData()
                  formData.append('name', data.name)
                  formData.append('brandName', data.brandName)
                  formData.append('email', data.email)
                  formData.append('password', data.password)
                  formData.append('logo', data.logo as File)
                  return formData
              })()
            : {
                  brandName: data.brandName,
                  name: data.name,
                  email: data.email,
                  password: data.password,
              }

        const response = await api.post(
            '/api/v1/auth/setup',
            payload,
            hasLogo
                ? {
                      headers: {
                          'Content-Type': 'multipart/form-data',
                      },
                  }
                : undefined,
        )
        return response.data.data
    },

    me: async (): Promise<AuthUser | null> => {
        const response = await api.get('/api/v1/auth/me')
        return response.data.data
    },

    logout: async () => {
        await api.post('/auth/logout')
    },

    refresh: async () => {
        const response = await api.post('/api/v1/auth/refresh')
        return response.data
    },
}
