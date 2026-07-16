import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'

export enum NotificationMessagesCtaEnum {
    ALLOW = 'ALLOW',
    GET = 'GET',
    GET_UPDATES = 'GET_UPDATES',
    OPT_IN = 'OPT_IN',
    SIGN_UP = 'SIGN_UP',
}

export type PageSettingsMessage = {
    id: number | null
    pageId: number
    typeConfiguration: 'FIRSTMESSAGE' | 'UNSUBSCRIBE' | null
    text: string | null
    buttonTitle?: string | null
    buttonUrl?: string | null
    notificationMessagesCtaText?: NotificationMessagesCtaEnum | null
    pageName: string | null
    isRcnInvite?: boolean
    createdAt?: string | null
    updatedAt?: string | null
}

export type CreatePageSettingsMessagePayload = {
    pageId: number
    typeConfiguration: 'FIRSTMESSAGE' | 'UNSUBSCRIBE'
    text: string
    buttonTitle?: string
    buttonUrl?: string
    notificationMessagesCtaText?: NotificationMessagesCtaEnum
}

export type UpdatePageSettingsMessagePayload = Partial<Omit<CreatePageSettingsMessagePayload, 'pageId'>>

const getApiErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError && error.response?.data?.message) {
        if (typeof error.response.data.message === 'string') {
            return error.response.data.message;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Ocorreu um erro inesperado.';
};


export function usePageSettingsMessages(pageId: number) {
    return useQuery<PageSettingsMessage[]>({
        queryKey: ['page-settings-message', pageId],
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/page_settings_message/${pageId}`)
            return data.data
        },
        enabled: !!pageId,
    })
}

export function useCreatePageSettingsMessage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: CreatePageSettingsMessagePayload) => {
            const { data } = await api.post('/api/v1/page_settings_message', payload)
            return data
        },
        onSuccess: (_data, variables) => {
            toast.success(`Mensagem ${variables.typeConfiguration === 'FIRSTMESSAGE' ? 'inicial' : 'de saída'} criada com sucesso!`)
            queryClient.invalidateQueries({ queryKey: ['page-settings-message', variables.pageId] })
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error))
        },
    })
}

export function useUpdatePageSettingsMessage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
                               id,
                               data,
                           }: {
            id: number
            data: UpdatePageSettingsMessagePayload
            pageId: number
        }) => {
            const response = await api.patch(`/api/v1/page_settings_message/${id}`, data)
            return response.data
        },
        onSuccess: (_data, variables) => {
            toast.success('Mensagem atualizada com sucesso!')
            queryClient.invalidateQueries({ queryKey: ['page-settings-message', variables.pageId] })
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error))
        },
    })
}

export function useDeletePageSettingsMessage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id }: { id: number }) => {
            const { data } = await api.delete(`/api/v1/page_settings_message/${id}`)
            return data
        },
        onSuccess: (_data, variables: { id: number; pageId: number }) => {
            toast.success('Mensagem excluída com sucesso!')
            queryClient.invalidateQueries({ queryKey: ['page-settings-message', variables.pageId] })
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error))
        },
    })
}