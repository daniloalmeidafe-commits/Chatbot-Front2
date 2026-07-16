'use client'

import { useQuery } from '@tanstack/react-query'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Topbar } from '@/components/Topbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token)
    const setUser = useAuthStore((s) => s.setUser)
    const logout = useAuthStore((s) => s.logout)
    const isHydrated = useAuthStore((s) => s.isHydrated)
    const router = useRouter()
    const currentUserQuery = useQuery({
        queryKey: ['auth', 'me', token],
        queryFn: AuthService.me,
        enabled: isHydrated && !!token,
        retry: false,
        staleTime: 1000 * 60,
    })

    useEffect(() => {
        if (isHydrated && !token) {
            router.replace('/login')
        }
    }, [isHydrated, token, router])

    useEffect(() => {
        if (currentUserQuery.data) {
            setUser(currentUserQuery.data)
        }
    }, [currentUserQuery.data, setUser])

    useEffect(() => {
        if (!token || currentUserQuery.isPending) {
            return
        }

        if (currentUserQuery.isError || currentUserQuery.data === null) {
            logout()
            router.replace('/login')
        }
    }, [currentUserQuery.data, currentUserQuery.isError, currentUserQuery.isPending, logout, router, token])

    if (
        !isHydrated ||
        (!!token &&
            (currentUserQuery.isPending ||
                currentUserQuery.isError ||
                currentUserQuery.data === null))
    ) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
                Carregando...
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
            <Sidebar />

            <div className="flex-1 flex flex-col min-h-screen">
                <Topbar />
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
