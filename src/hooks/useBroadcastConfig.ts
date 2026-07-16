// src/hooks/useBroadcastConfig.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'react-toastify'

export type BroadcastConfig = {
    id: number
    projectId: number
    timezone: string
    schedules: string
    urls: string | string[]
}

export function useBroadcastConfig(projectId: number) {
    return useQuery<BroadcastConfig | null>({
        queryKey: ['broadcast-config', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/broadcasts-config-project/${projectId}`)
            return data.data
        },
        enabled: !!projectId,
    })
}

export function useCreateBroadcastConfig() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: {
            timezone: string
            schedules: string
            urls: string
            projectId: number
            message_tag: string
        }) => {
            const { data } = await api.post(`/api/v1/broadcasts-config-project`, payload)
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-config', variables.projectId] })
        },
    })
}

export function useUpdateBroadcastConfig() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
                               id,
                               payload,
                           }: {
            id: number
            payload: {
                timezone: string
                schedules: string
                urls: string
            }
        }) => {
            const { data } = await api.patch(`/api/v1/broadcasts-config-project/${id}`, payload)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-config'] })
        },
    })
}

export function useDeleteBroadcastConfig() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/v1/broadcasts-config-project/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-config'] })
        },
    })
}

export enum MessageTag {
    NON_PROMO = 'Non Promo',
    PROMO_24H = '24H Promo',
    RECURRING = 'Recurring',
}

export type BroadcastConfigsList = {
    id: number
    projectId: number
    timezone: string
    schedules: string
    urls: string | string[]
    message_tag: MessageTag
    status: 'enabled' | 'disabled'
}

export function useBroadcastConfigsList(projectId: number) {
    return useQuery<BroadcastConfigsList[]>({
        queryKey: ['broadcast-configs-list', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/broadcasts-config-project/${projectId}`)
            return data.data || []
        },
        enabled: !!projectId,
    })
}

export function useCreateBroadcastConfigWithTag() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: {
            timezone: string
            schedules: string
            urls: string
            projectId: number
            message_tag: MessageTag
        }) => {
            const { data } = await api.post(`/api/v1/broadcasts-config-project`, payload)
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-configs-list', variables.projectId] })
        },
    })
}

export function useUpdateBroadcastConfigWithTag() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
                               id,
                               payload,
                           }: {
            id: number
            payload: {
                timezone: string
                schedules: string
                urls: string
                message_tag: MessageTag,
                projectId: number,
            }
        }) => {
            const { data } = await api.patch(`/api/v1/broadcasts-config-project/${id}`, payload)
            return data
        },
        onSuccess: (response) => {
            const updatedConfig = response?.data as BroadcastConfigsList
            if (updatedConfig?.projectId) {
                queryClient.invalidateQueries({ queryKey: ['broadcast-configs-list', updatedConfig.projectId] })
            } else {
                queryClient.invalidateQueries({ queryKey: ['broadcast-configs-list'] });
            }
        },
    })
}

export function useDeleteBroadcastConfigWithTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: number, projectId: number }) => {
            await api.delete(`/api/v1/broadcasts-config-project/${id}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-configs-list', variables.projectId] });
            toast.success('Configuração desativada com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao desativar a configuração.');
        }
    });
}