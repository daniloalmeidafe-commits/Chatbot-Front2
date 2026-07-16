import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'react-toastify'
import { AttachmentPayload } from '@/app/(app)/projects/[id]/automations/[automationId]/flowbuilder/page';


export type Automation = {
    id: number
    projectId: number
    name: string
    createdAt: string
    updatedAt: string
    status?: 'enabled' | 'disabled'
}

type CreateAutomationDto = {
    projectId: number
    name: string
}

type UpdateAutomationDto = Partial<{
    name: string,
    status?: 'enabled' | 'disabled';
}>

type AutomationStep = {
    id: number
    automationId: number
    stepOrder: number
    delayMinutes: number
    messagePayload: {
        text: string
        buttons: Array<{ type: string; title: string; url: string }>
        image_url?: string
    }
    createdAt: string
    updatedAt: string
}

export type CreateAutomationStepDto = {
    stepOrder: number
    delayMinutes: number
    messagePayload: AttachmentPayload
}

export function useAutomations(projectId: number, options?: { enabled?: boolean }) {
    return useQuery<Automation[]>({
        queryKey: ['automations', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/automations/by-project/${projectId}`)
            return data.data as Automation[]
        },
        enabled: options?.enabled ?? true,
    })
}

export function useCreateAutomation() {
    const queryClient = useQueryClient()
    return useMutation<unknown, Error, CreateAutomationDto>({
        mutationFn: payload => api.post('/api/v1/automations', payload),
        onSuccess: (_, vars) => {
            toast.success('Automação criada com sucesso!')
            queryClient.invalidateQueries({ queryKey: ['automations', vars.projectId] })
        },
        onError: () => toast.error('Erro ao criar automação.'),
    })
}

export function useUpdateAutomation() {
    const queryClient = useQueryClient()
    return useMutation<unknown, Error, { id: number; payload: UpdateAutomationDto }>({
        mutationFn: ({ id, payload }) => api.patch(`/api/v1/automations/${id}`, payload),
        onSuccess: () => {
            toast.success('Automação atualizada!')
            queryClient.invalidateQueries({ queryKey: ['automations'] })
        },
        onError: () => toast.error('Erro ao atualizar automação.'),
    })
}

export function useDeleteAutomation() {
    const queryClient = useQueryClient()
    return useMutation<unknown, Error, number>({
        mutationFn: id => api.delete(`/api/v1/automations/${id}`),
        onSuccess: () => {
            toast.success('Automação excluída.')
            queryClient.invalidateQueries({ queryKey: ['automations'] })
        },
        onError: () => toast.error('Erro ao excluir automação.'),
    })
}

export function useAutomationSteps(automationId: number, options?: { enabled?: boolean }) {
    return useQuery<AutomationStep[]>({
        queryKey: ['automation-steps', automationId],
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/automations/${automationId}/steps`)
            return data.data as AutomationStep[]
        },
        enabled: options?.enabled ?? true,
    })
}

export function useSaveAutomationSteps(automationId: number) {
    const queryClient = useQueryClient()
    return useMutation<void, Error, CreateAutomationStepDto[]>({
        mutationFn: async steps => {
            await api.post(`/api/v1/automations/${automationId}/steps`, steps)
        },
        onSuccess: () => {
            toast.success('Automação salva com sucesso!')
            queryClient.invalidateQueries({ queryKey: ['automation-steps', automationId] })
        },
        onError: () => {
            toast.error('Erro ao salvar automação.')
        },
    })
}

export function useExportAutomation() {
    return useMutation({
        mutationFn: async (automationId: number) => {
            const response = await api.get(`/api/v1/automations/export/${automationId}`);
            return response.data.data;
        },
        onSuccess: (data) => {
            try {
                const jsonString = JSON.stringify(data, null, 2);
                navigator.clipboard.writeText(jsonString);
                toast.success('Automação copiada para a área de transferência!');
            } catch (error) {
                toast.error('Erro ao copiar os dados da automação.');
                console.log(error);
            }
        },
        onError: () => {
            toast.error('Não foi possível exportar a automação.');
        }
    });
}

export function useImportAutomation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ projectId, automationData }: { projectId: number; automationData: Record<string, unknown> }) => {
            const response = await api.post(`/api/v1/automations/import/${projectId}`, automationData);
            return response.data;
        },
        onSuccess: (data, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['automations', projectId] });
            toast.success('Automação importada com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao importar a automação. Verifique o formato dos dados.');
        }
    });
}
