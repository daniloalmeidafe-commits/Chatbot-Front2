// src/hooks/useProjectBroadcasts.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export type BroadcastStatus = 'sent' | 'processing' | 'failed'

export type Broadcast = {
    id: number
    status: BroadcastStatus
    totalSent: number
    createdAt: string
    updatedAt: string
}

export interface AuditData {
    page_id: number
    page_name: string
    enviados: number
    falhos: number
    log_erros: string
}

export function useProjectBroadcasts({
                                         projectId,
                                         status,
                                         startDate,
                                         endDate,
                                         page = 1,
                                         limit = 20,
                                     }: {
    projectId: number
    status?: BroadcastStatus
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}) {
    return useQuery({
        queryKey: ['project-broadcasts', projectId, status, startDate, endDate, page, limit],
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/broadcasts/project/${projectId}`, {
                params: { status, startDate, endDate, page, limit },
            })
            return data.data
        },
        enabled: !!projectId,
    })
}

export function useBroadcastAudit(broadcastId: number) {
    return useQuery<AuditData[]>({
        queryKey: ['broadcast-audit', broadcastId],
        queryFn: async () => {
            const { data } = await api.get(`/api/v1/broadcasts/audit/${broadcastId}`)
            return data.data || []
        },
        enabled: !!broadcastId,
    })
}
