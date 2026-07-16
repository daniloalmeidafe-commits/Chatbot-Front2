import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

type DashboardData = {
    projectsCount: number
    activePagesCount: number
    leadsLast30Days: number
    totalLeadsCount: number
    totalUnsubscribe: number
    totalValid: number
    totalLeadsPerProject: {
        projectId: number
        projectName: string
        leadCount: number
        unsubscribeLeadCount: number
        validCount: number
    }[]
}

export function useDashboard(userId: string | undefined) {
    return useQuery({
        queryKey: ['dashboard', userId],
        enabled: !!userId,
        queryFn: async () => {
            const response = await api.get<{ data: DashboardData }>(
                `/api/v1/dashboard/${userId}`
            )
            return response.data.data
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })
}