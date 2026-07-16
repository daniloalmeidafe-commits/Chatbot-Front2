'use client'

import {create, StateCreator} from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '@/types/auth'

type AuthState = {
    token: string | null
    refreshToken: string | null
    user: AuthUser | null
    isHydrated: boolean
    login: (payload: { token: string; refreshToken: string; user: AuthUser }) => void
    setUser: (user: AuthUser | null) => void
    logout: () => void
}

let _set: Parameters<StateCreator<AuthState>>[0]
let _get: Parameters<StateCreator<AuthState>>[1] // eslint-disable-line @typescript-eslint/no-unused-vars

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => {
            _set = set
            _get = get

            return {
                token: null,
                refreshToken: null,
                user: null,
                isHydrated: false,
                login: ({ token, refreshToken, user }) => {
                    set({ token, refreshToken, user })
                },
                setUser: (user) => {
                    set({ user })
                },
                logout: () => {
                    set({ token: null, refreshToken: null, user: null })
                },
            }
        },
        {
            name: 'auth-storage',
            onRehydrateStorage: () => () => {
                _set({ isHydrated: true })
            },
        }
    )
)
