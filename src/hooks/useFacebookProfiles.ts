import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export type FacebookProfile = {
    id: number
    name: string
    description: string
    email: string
    accessToken: string
    profileId: string
    projectId: number
    pageCount: number
}

export type FacebookProfilesResponse = {
    projectName: string;
    profiles: FacebookProfile[];
}

export type CreateFacebookProfileDto = {
    name: string
    description: string
    email: string
    accessToken: string
    profileId: string
    projectId: number
}

export type UpdateFacebookProfileDto = {
    name?: string
    description?: string
    email?: string
    accessToken?: string
}

export function useFacebookProfiles(projectId: number) {
    return useQuery<FacebookProfilesResponse>({
        queryKey: ['facebook-profiles', projectId],
        queryFn: async () => {
            const { data } = await api.get('/api/v1/profiles', {
                params: { projectId },
            })
            return data.data
        },
        enabled: !!projectId,
    })
}

export function useCreateFacebookProfile() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: CreateFacebookProfileDto) => {
            const response = await api.post('/api/v1/profiles', payload)
            return response.data.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['facebook-profiles', variables.projectId] })
        },
    })
}

export function useUpdateFacebookProfile(projectId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: UpdateFacebookProfileDto }) => {
            const { data } = await api.patch(`/api/v1/profiles/${id}`, payload)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facebook-profiles', projectId] })
        },
    })
}

export function useDeleteFacebookProfile(projectId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/v1/profiles/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['facebook-profiles', projectId] })
        },
    })
}