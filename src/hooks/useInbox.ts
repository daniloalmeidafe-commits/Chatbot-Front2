import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export type ConversationMessage = {
    id: number
    lead_id: number
    page_id: number
    direction: 'incoming' | 'outgoing'
    text: string | null
    sender_type: 'user' | 'bot' | 'human_agent'
    sent_at: string
}

export type Conversation = {
    leadId: number
    firstName: string | null
    lastName: string | null
    lastMessage: string | null
    lastEngagementAt: string | null
    canReply: boolean
}

export type ConversationsResponse = {
    data: Conversation[]
    total: number
    page: number
    limit: number
}

export function useConversations(pageId: number, page = 1, limit = 20) {
    return useQuery<ConversationsResponse>({
        queryKey: ['inbox-conversations', pageId, page],
        queryFn: async () => {
            const { data } = await api.get(
                `/api/v1/inbox/pages/${pageId}/conversations`,
                { params: { page, limit } }
            )
            return data
        },
        enabled: !!pageId,
        refetchInterval: 10000,
    })
}

export function useMessages(leadId: number | null, pageId: number) {
    return useQuery<ConversationMessage[]>({
        queryKey: ['inbox-messages', leadId, pageId],
        queryFn: async () => {
            const { data } = await api.get(
                `/api/v1/inbox/pages/${pageId}/leads/${leadId}/messages`
            )
            return data
        },
        enabled: !!leadId && !!pageId,
        refetchInterval: 5000,
    })
}

export function useSendHumanAgentReply(pageId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ leadId, text }: { leadId: number; text: string }) => {
            const { data } = await api.post(
                `/api/v1/inbox/pages/${pageId}/leads/${leadId}/human-agent-reply`,
                { text }
            )
            return data
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['inbox-messages', variables.leadId, pageId] })
            queryClient.invalidateQueries({ queryKey: ['inbox-conversations', pageId] })
        },
    })
}

export function useSendUtilityMessage(pageId: number) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ leadId, text }: { leadId: number; text: string }) => {
            const { data } = await api.post(
                `/api/v1/inbox/pages/${pageId}/leads/${leadId}/utility-message`,
                { text }
            )
            return data
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['inbox-messages', variables.leadId, pageId] })
            queryClient.invalidateQueries({ queryKey: ['inbox-conversations', pageId] })
        },
    })
}
