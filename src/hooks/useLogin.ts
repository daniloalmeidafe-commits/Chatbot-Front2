'use client'
import { useMutation } from '@tanstack/react-query'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

type LoginPayload = {
    email: string
    password: string
}

export const useLogin = () => {
    const loginToStore = useAuthStore((state) => state.login)

    return useMutation({
        mutationFn: (data: LoginPayload) => AuthService.login(data),

        onSuccess: (data) => {
            loginToStore({
                token: data.token,
                refreshToken: data.refreshToken,
                user: {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                },
            })
        },
    })
}
