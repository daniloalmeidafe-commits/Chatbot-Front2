import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export type Project = {
    id: number
    name: string
    description: string
    createdAt: string
    updatedAt: string
    statusBroadcast: string
    totalProfiles: number
    availableCopys: number
    project_type: 'BroadcastStandard' | 'RCN'
    meta_pixel_id?: string | null
    meta_capi_access_token?: string | null
}

export type CreateProjectDto = {
    name: string
    description: string
    userId: string
    project_type?: 'BroadcastStandard' | 'RCN'
}

export type UpdateProjectDto = {
    name?: string
    description?: string
    statusBroadcast?: 'enabled' | 'disabled'
    meta_pixel_id?: string
    meta_capi_access_token?: string
}

export function useProjects() {
    return useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await api.get('/api/v1/projects')
            return data.data
        },
    })
}

export function useProjectById(projectId: number | null | undefined) {
    return useQuery<Project>({
        queryKey: ['project', projectId],
        queryFn: async () => {
            console.log('project', projectId)
            const { data } = await api.get(`/api/v1/projects/${projectId}`)
            console.log(data)
            return data.data
        },
    })
}


export function useCreateProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: CreateProjectDto) => {
            const response = await api.post('/api/v1/projects', payload)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['project'] })
        },
    })
}

export function useUpdateProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: UpdateProjectDto }) => {
            const { data } = await api.patch(`/api/v1/projects/${id}`, payload)
            return data
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
        },
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/v1/projects/${id}`)
        },
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['project', id] })
        },
    })
}