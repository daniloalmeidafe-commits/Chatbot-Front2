'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthService, SetupPayload } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

export function useSetupStatus(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['setup-status'],
        queryFn: AuthService.getSetupStatus,
        enabled: options?.enabled ?? true,
        retry: false,
        staleTime: 1000 * 30,
    })
}

export function useSetup() {
    const queryClient = useQueryClient()
    const loginToStore = useAuthStore((state) => state.login)

    return useMutation({
        mutationFn: (data: SetupPayload) => AuthService.setup(data),
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
            queryClient.invalidateQueries({ queryKey: ['branding'] })
        },
    })
}
