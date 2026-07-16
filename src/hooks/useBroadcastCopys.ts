// src/hooks/useBroadcastCopys.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export type ProjectStockReport = {
    nome_projeto: string;
    project_id: number;
    total_disparos_dia: number;
    copys_nao_usadas: number;
    total_copys_geral: number;
    dias_conteudo_novo: number;
    dias_conteudo_usado: number;
    dias_conteudo_total: number;
}

export type ResetBroadcastCopysProjectDTO = {
    daysToReset: number;
}

export type ResetResponse = {
    status: boolean;
    statusCode: 200;
    message: string;
    affected: number;
}

export type Copy = {
    id: number;
    projectId: number;
    text: string;
    buttonTitle: string;
    isUsed: 'yes' | 'no';
    type: 'button' | 'image';
    imageUrl: string | null;
    subtitle: string | null;
    createdAt: string;
    updatedAt: string;
}

export type CreateBroadcastCopyDto = {
    projectId: number;
    text: string;
    buttonTitle: string;
    type: 'button' | 'image';
    imageUrl?: string;
    subtitle?: string;
}

export type UpdateBroadcastCopyDto = Partial<Omit<CreateBroadcastCopyDto, 'projectId'>> & { isUsed?: 'yes' | 'no' };

export function useProjectStockReport() {
    return useQuery<ProjectStockReport[]>({
        queryKey: ['broadcast-stock-report'],
        queryFn: async () => {
            const { data } = await api.get('/api/v1/broadcasts-copys-project/stock-report');
            // O backend retorna um array de objetos ProjectStockReport
            return data.data || [];
        },
    });
}

export function useResetBroadcastCopies() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ projectId, daysToReset }: { projectId: number; daysToReset: number }) => {
            const payload: ResetBroadcastCopysProjectDTO = { daysToReset };
            const { data } = await api.patch(`/api/v1/broadcasts-copys-project/reset-copies/${projectId}`, payload);
            return data.data as ResetResponse; // Assumindo que a resposta de sucesso está em data.data
        },
        onSuccess: () => {
            // Invalida o relatório de estoque, pois os dados foram alterados no backend
            queryClient.invalidateQueries({ queryKey: ['broadcast-stock-report'] });
        },
    });
}

export function useBroadcastCopys(projectId: number) {
    return useQuery<Copy[]>({
        queryKey: ['broadcast-copys', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/broadcasts-copys-project/${projectId}`);
            return data.data || [];
        },
        enabled: !!projectId,
    });
}

export function useCreateBroadcastCopy() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateBroadcastCopyDto) => api.post('/api/v1/broadcasts-copys-project', payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-copys', variables.projectId] });
        },
    });
}

export function useUpdateBroadcastCopy() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateBroadcastCopyDto }) => {
            return api.patch(`/api/v1/broadcasts-copys-project/${id}`, data);
        },
        onSuccess: (response: { data?: { data?: { projectId?: number } } }) => {
            const projectId = response?.data?.data?.projectId;
            if (projectId) {
                queryClient.invalidateQueries({ queryKey: ['broadcast-copys', projectId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['broadcast-copys'] });
            }
        },
    });
}

export function useDeleteBroadcastCopy() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id }: { id: number; projectId: number }) => {
            await api.delete(`/api/v1/broadcasts-copys-project/${id}`)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-copys', variables.projectId] })
        },
    })
}

export function useMarkAllBroadcastCopysUnused() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ projectId }: { projectId: number }) => {
            return api.patch(`/api/v1/broadcasts-copys-project/mark-unused/${projectId}`, {}, { headers: { 'Content-Type': 'application/json' } })
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['broadcast-copys', variables.projectId] })
        },
    })
}