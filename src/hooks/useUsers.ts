'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { AuthRole, RoleName } from '@/types/auth'

export type ManagedUser = {
    id: string
    name: string | null
    email: string | null
    status?: 'ACTIVE' | 'INACTIVE'
    createdAt: string
    updatedAt: string
    role?: AuthRole | null
}

export type UsersResponse = {
    response: ManagedUser[]
    hasNextPage: boolean
}

export type CreateUserPayload = {
    name: string
    email: string
    password: string
    role: {
        name: RoleName
    }
}

export type UpdateUserPayload = {
    name?: string
    email?: string
    password?: string
    role?: {
        name: RoleName
    }
}

export function useUsers(page: number, limit = 10) {
    return useQuery<UsersResponse>({
        queryKey: ['users', page, limit],
        queryFn: async () => {
            const { data } = await api.get('/api/v1/users', {
                params: {
                    page,
                    limit,
                    sort: JSON.stringify([
                        {
                            orderBy: 'createdAt',
                            order: 'DESC',
                        },
                    ]),
                },
            })

            return data.data
        },
        placeholderData: (previousData) => previousData,
        retry: false,
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: CreateUserPayload) => {
            const { data } = await api.post('/api/v1/users', payload)
            return data.data as ManagedUser
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string
            payload: UpdateUserPayload
        }) => {
            const { data } = await api.patch(`/api/v1/users/${id}`, payload)
            return data.data as ManagedUser
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
        },
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/api/v1/users/${id}`)
        },
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['user', id] })
        },
    })
}
