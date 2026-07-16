import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'

export enum TemplateTypeEnum {
    BROADCAST_STANDARD = 'BroadcastStandard',
    RCN = 'RCN'
}

export enum NotificationMessagesCtaEnum {
    ALLOW = 'ALLOW',
    GET = 'GET',
    GET_UPDATES = 'GET_UPDATES',
    OPT_IN = 'OPT_IN',
    SIGN_UP = 'SIGN_UP',
}

export type PageTemplateSetting = {
    id: number;
    name: string;
    description: string;
    payloadFirstMessageText: string;
    payloadFirstMessageButtonTitle: string | null;
    payloadFirstMessageButtonUrl: string | null;
    notificationMessagesCtaText: NotificationMessagesCtaEnum | null;
    payloadUnsubscribeText: string;
    stopKeywords: string;
    stopKeyWordsComments: string | null;
    commentAutoReply: string | null;
    userId: string;
    templateType: TemplateTypeEnum;
    createdAt: string;
    updatedAt: string;
};

export type CreatePageTemplateSettingPayload = {
    name: string;
    description?: string;
    payloadFirstMessageText: string;
    payloadFirstMessageButtonTitle?: string;
    payloadFirstMessageButtonUrl?: string;
    notificationMessagesCtaText?: NotificationMessagesCtaEnum;
    payloadUnsubscribeText: string;
    stopKeywords: string;
    stopKeyWordsComments?: string;
    commentAutoReply?: string;
    templateType?: TemplateTypeEnum;
    userId: string;
};

export type UpdatePageTemplateSettingPayload = Partial<Omit<CreatePageTemplateSettingPayload, 'userId'>>;

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

export function useGetPageTemplateSettings(userId: string | undefined) {
    return useQuery<PageTemplateSetting[]>({
        queryKey: ['page-template-settings', userId],
        queryFn: async () => {
            const response = await api.get('/api/v1/page_template_settings');
            return response.data.data || [];
        },
        enabled: !!userId,
    });
}

export function useCreatePageTemplateSetting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreatePageTemplateSettingPayload) => {
            const response = await api.post('/api/v1/page_template_settings', payload);
            return response.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['page-template-settings', data.userId] });
            toast.success('Template criado com sucesso!');
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error));
        },
    });
}

export function useUpdatePageTemplateSetting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: UpdatePageTemplateSettingPayload }) => {
            const response = await api.patch(`/api/v1/page_template_settings/${id}`, payload);
            return response.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['page-template-settings', data.userId] });
            toast.success('Template atualizado com sucesso!');
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error));
        },
    });
}

export function useDeletePageTemplateSetting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/v1/page_template_settings/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['page-template-settings'] });
            toast.success('Template excluído com sucesso!');
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error));
        },
    });
}

export function useApplyPageTemplateSetting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ templateId, pageIds }: { templateId: number; pageIds: number[] }) => {
            const response = await api.post(`/api/v1/page_template_settings/${templateId}/apply`, { pageIds });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facebook-pages-by-profile'] });
            queryClient.invalidateQueries({ queryKey: ['page-settings-message'] });
            toast.success('Template aplicado com sucesso às páginas selecionadas!');
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error));
        },
    });
}