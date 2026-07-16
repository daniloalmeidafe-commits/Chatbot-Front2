'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Loader2, Send, UserCheck, Bell, ArrowLeft } from 'lucide-react'
import {
    useConversations,
    useMessages,
    useSendHumanAgentReply,
    useSendUtilityMessage,
    Conversation,
} from '@/hooks/useInbox'

function formatTime(dateStr: string | null) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function InboxPage() {
    const router = useRouter()
    const { pageId } = useParams<{ pageId: string }>()
    const parsedPageId = Number(pageId)

    const [selectedLead, setSelectedLead] = useState<Conversation | null>(null)
    const [text, setText] = useState('')
    const [sendMode, setSendMode] = useState<'human' | 'utility'>('human')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { data: conversationsData, isLoading: loadingConversations } = useConversations(parsedPageId)
    const { data: messages, isLoading: loadingMessages } = useMessages(
        selectedLead?.leadId ?? null,
        parsedPageId
    )
    const humanReply = useSendHumanAgentReply(parsedPageId)
    const utilityMsg = useSendUtilityMessage(parsedPageId)

    const isSending = humanReply.isPending || utilityMsg.isPending

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function handleSend() {
        if (!text.trim() || !selectedLead) return

        const payload = { leadId: selectedLead.leadId, text: text.trim() }

        if (sendMode === 'human') {
            humanReply.mutate(payload, {
                onSuccess: () => {
                    setText('')
                    toast.success('Mensagem enviada como Agente Humano')
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message ?? 'Erro ao enviar mensagem')
                },
            })
        } else {
            utilityMsg.mutate(payload, {
                onSuccess: () => {
                    setText('')
                    toast.success('Mensagem utilitária enviada')
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message ?? 'Erro ao enviar mensagem')
                },
            })
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const conversations = conversationsData?.data ?? []

    return (
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
            {/* ── Sidebar: lista de conversas ── */}
            <aside className="w-80 flex-shrink-0 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold">Inbox</h2>
                    {conversations.length > 0 && (
                        <span className="ml-auto bg-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {conversations.length}
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm mt-10 px-4">
                            Nenhuma conversa encontrada.
                        </p>
                    ) : (
                        conversations.map((conv) => {
                            const isSelected = selectedLead?.leadId === conv.leadId
                            const name = [conv.firstName, conv.lastName].filter(Boolean).join(' ') || 'Usuário'
                            return (
                                <button
                                    key={conv.leadId}
                                    onClick={() => setSelectedLead(conv)}
                                    className={[
                                        'w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors',
                                        isSelected ? 'bg-gray-800 border-l-2 border-l-blue-500' : '',
                                    ].join(' ')}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm truncate">{name}</span>
                                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                            {formatDate(conv.lastEngagementAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                        {conv.lastMessage ?? 'Sem mensagens'}
                                    </p>
                                    {!conv.canReply && (
                                        <span className="text-xs text-yellow-500 mt-0.5 block">
                                            ⚠ Fora da janela de 24h
                                        </span>
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>
            </aside>

            {/* ── Área principal: chat ── */}
            <main className="flex-1 flex flex-col min-w-0">
                {!selectedLead ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <UserCheck className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm">Selecione uma conversa para começar</p>
                    </div>
                ) : (
                    <>
                        {/* Header do chat */}
                        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {(selectedLead.firstName?.[0] ?? 'U').toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">
                                    {[selectedLead.firstName, selectedLead.lastName].filter(Boolean).join(' ') || 'Usuário'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {selectedLead.canReply ? 'Dentro da janela de resposta' : 'Fora da janela de 24h — use Mensagem Utilitária'}
                                </p>
                            </div>
                        </div>

                        {/* Mensagens */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                                </div>
                            ) : !messages || messages.length === 0 ? (
                                <p className="text-center text-gray-500 text-sm mt-10">
                                    Nenhuma mensagem ainda.
                                </p>
                            ) : (
                                messages.map((msg) => {
                                    const isOutgoing = msg.direction === 'outgoing'
                                    const isHuman = msg.sender_type === 'human_agent'
                                    return (
                                        <div
                                            key={msg.id}
                                            className={['flex flex-col', isOutgoing ? 'items-end' : 'items-start'].join(' ')}
                                        >
                                            <div
                                                className={[
                                                    'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm',
                                                    isOutgoing
                                                        ? isHuman
                                                            ? 'bg-green-700 text-white rounded-br-sm'
                                                            : 'bg-blue-600 text-white rounded-br-sm'
                                                        : 'bg-gray-800 text-gray-100 rounded-bl-sm',
                                                ].join(' ')}
                                            >
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {isOutgoing && isHuman && (
                                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                                        <UserCheck className="w-3 h-3" /> Agente Humano
                                                    </span>
                                                )}
                                                {isOutgoing && !isHuman && (
                                                    <span className="text-xs text-blue-400">Bot</span>
                                                )}
                                                <span className="text-xs text-gray-500">{formatTime(msg.sent_at)}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input de envio */}
                        <div className="px-6 py-4 border-t border-gray-800 space-y-3">
                            {/* Seletor de modo */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSendMode('human')}
                                    className={[
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                                        sendMode === 'human'
                                            ? 'bg-green-700 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
                                    ].join(' ')}
                                >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Agente Humano
                                </button>
                                <button
                                    onClick={() => setSendMode('utility')}
                                    className={[
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                                        sendMode === 'utility'
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
                                    ].join(' ')}
                                >
                                    <Bell className="w-3.5 h-3.5" />
                                    Mensagem Utilitária
                                </button>
                            </div>

                            {/* Aviso contextual */}
                            {sendMode === 'human' && (
                                <p className="text-xs text-green-400 bg-green-900 bg-opacity-30 px-3 py-1.5 rounded-lg">
                                    <strong>Human Agent:</strong> Use apenas para responder clientes que iniciaram contato nas últimas 7 dias. Requer permissão aprovada pela Meta.
                                </p>
                            )}
                            {sendMode === 'utility' && (
                                <p className="text-xs text-yellow-400 bg-yellow-900 bg-opacity-30 px-3 py-1.5 rounded-lg">
                                    <strong>Mensagem Utilitária:</strong> Use apenas para atualizações de conta, confirmações ou avisos relevantes ao serviço. Não use para marketing.
                                </p>
                            )}

                            {/* Campo de texto + botão */}
                            <div className="flex gap-2 items-end">
                                <textarea
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-blue-500 transition-colors"
                                    rows={2}
                                    placeholder="Digite sua mensagem... (Enter para enviar)"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isSending}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isSending || !text.trim()}
                                    className={[
                                        'p-3 rounded-xl transition-colors flex-shrink-0',
                                        sendMode === 'human'
                                            ? 'bg-green-700 hover:bg-green-600 disabled:opacity-40'
                                            : 'bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40',
                                    ].join(' ')}
                                >
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
