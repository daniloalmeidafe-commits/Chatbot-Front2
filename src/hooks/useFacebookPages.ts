import {useQuery, useQueryClient} from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import {toast} from "react-toastify";

type FacebookPage = {
    id: string
    name: string
    category: string
    access_token: string
}

export type FacebookPageDetails = {
    id: number
    pageId: string
    name: string
    pageAccessToken: string
    pageProfile?: string
    pageEmail?: string
    currentLeadCount: number
    leadCountLast24h: number
    currentUnsubscribedLeadCount: number
    welcomeMessage: string | null
    receiveWelcomeMessage: string
    stopKeywords: string | null
    stopKeyWordsComments: string | null
    commentAutoReply: string | null
    status: string
    createdAt: string
    updatedAt: string
    profile: {
        id: number
        name: string
        description: string
        email: string
        accessToken: string
        profileId: string
        createdAt: string
        updatedAt: string
    }
}

export type FacebookPagesByProfileResponse = {
    data: FacebookPageDetails[]
    total: number
    page: number
    limit: number
}

export function useFacebookPages(profileId: number, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['facebook-pages', profileId],
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/facebook/pages`, {
                params: { profileId },
            })

            return data.data?.data ?? []
        },
        enabled: options?.enabled ?? true,
    })
}

export function useSaveFacebookPages() {
    return useMutation({
        mutationFn: async ({ profileId, pages }: { profileId: number; pages: FacebookPage[] }) => {
            const { data } = await api.post(`/api/v1/facebook-pages?profileId=${profileId}`, pages)
            return data
        },
    })
}

export function useFacebookPagesByProfile(
    profileId: number,
    page = 1,
    limit = 20,
    name?: string
) {
    return useQuery<FacebookPagesByProfileResponse>({
        queryKey: ['facebook-pages-by-profile', profileId, page, limit, name],
        queryFn: async () => {
            const { data } = await api.get('/api/v1/facebook-pages/by-profile', {
                params: { profileId, page, limit, name },
            })
            return data.data
        },
        enabled: !!profileId,
    })
}

export function useUpdateFacebookPageSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
                               pageId,
                               payload,
                           }: {
            pageId: number
            payload: Partial<{
                receiveWelcomeMessage: 'enabled' | 'disabled'
                stopKeywords: string
                stopKeyWordsComments: string
                commentAutoReply: string
                welcomeMessage: string
                status: 'enabled' | 'disabled'
            }>
        }) => {
            const { data } = await api.patch(`/api/v1/facebook-pages/${pageId}`, payload)
            return data
        },
        onSuccess: (_, { payload }) => {
            if (payload.receiveWelcomeMessage) {
                toast.success(
                    `Resposta automática ${payload.receiveWelcomeMessage === 'enabled' ? 'ativada' : 'desativada'}!`
                )
            } else {
                toast.success('Configurações da página atualizadas!')
            }

            queryClient.invalidateQueries({ queryKey: ['facebook-pages-by-profile'] })
        },
        onError: () => {
            toast.error('Erro ao atualizar status da resposta automática.')
        },
    })
}

export function useDeleteFacebookPage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
                               profileId,
                               pageId,
                           }: {
            profileId: number
            pageId: number
        }) => {
            const { data } = await api.delete('/api/v1/facebook-pages', {
                params: { profileId, pageId },
            })
            return data
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['facebook-pages-by-profile', variables.profileId],
            })
        },
        onError: () => {
            console.error('Erro ao excluir a página do Facebook.')
        },
    })
}

export function useImportLeads() {
    return useMutation({
        mutationFn: async (facebookPageId: number) => {
            const { data } = await api.get('/api/v1/facebook/get-leads', {
                params: { facebookPageId },
            })
            return data.data
        },
    })
}

export function useSyncFacebookPages() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (profileId: number) => {
            const response = await api.get(`/api/v1/facebook/sync-pages?profileId=${profileId}`)
            return response.data.data.data;
        },
        onSuccess: (data, profileId) => {
            queryClient.invalidateQueries({ queryKey: ['facebook-pages-by-profile', profileId] })
        },
    })
}
