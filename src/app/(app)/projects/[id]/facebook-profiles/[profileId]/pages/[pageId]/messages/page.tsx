'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    usePageSettingsMessages,
    useCreatePageSettingsMessage,
    useUpdatePageSettingsMessage,
    useDeletePageSettingsMessage,
    PageSettingsMessage,
    NotificationMessagesCtaEnum,
    CreatePageSettingsMessagePayload,
    UpdatePageSettingsMessagePayload
} from '@/hooks/usePageSettingsMessages'
import { useProjectById } from '@/hooks/useProjects'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'

const ctaTextDisplay: Record<NotificationMessagesCtaEnum, string> = {
    [NotificationMessagesCtaEnum.ALLOW]: "Permitir mensagens",
    [NotificationMessagesCtaEnum.GET]: "Receber mensagens",
    [NotificationMessagesCtaEnum.GET_UPDATES]: "Receber atualizações",
    [NotificationMessagesCtaEnum.OPT_IN]: "Aceitar mensagens",
    [NotificationMessagesCtaEnum.SIGN_UP]: "Cadastre-se para receber mensagens",
};

export default function PageSettingsMessagesPage() {
    const router = useRouter()
    const { id: projectId, pageId } = useParams<{ id: string, pageId: string }>()
    const parsedProjectId = Number(projectId)
    const parsedPageId = Number(pageId)

    const { data: project, isLoading: isLoadingProject } = useProjectById(parsedProjectId)
    const isRcnProject = project?.project_type === 'RCN'


    const { data: settings, refetch, isLoading: isLoadingSettings } = usePageSettingsMessages(parsedPageId)
    const create = useCreatePageSettingsMessage()
    const update = useUpdatePageSettingsMessage()
    const remove = useDeletePageSettingsMessage()

    const [pageName, setPageName] = useState('')
    const [form, setForm] = useState({
        FIRSTMESSAGE: { text: '', buttonTitle: '', buttonUrl: '', notificationMessagesCtaText: NotificationMessagesCtaEnum.GET_UPDATES },
        UNSUBSCRIBE: { text: '', buttonTitle: '', buttonUrl: '', notificationMessagesCtaText: NotificationMessagesCtaEnum.GET_UPDATES }
    })

    useEffect(() => {
        if (settings) {
            const updated = {
                FIRSTMESSAGE: { text: '', buttonTitle: '', buttonUrl: '', notificationMessagesCtaText: NotificationMessagesCtaEnum.GET_UPDATES },
                UNSUBSCRIBE: { text: '', buttonTitle: '', buttonUrl: '', notificationMessagesCtaText: NotificationMessagesCtaEnum.GET_UPDATES }
            }
            let foundPageName = '';
            settings.forEach((msg: PageSettingsMessage) => {
                foundPageName = msg.pageName || '';
                const key = msg.typeConfiguration as 'FIRSTMESSAGE' | 'UNSUBSCRIBE'
                if (key) {
                    updated[key] = {
                        text: msg.text || '',
                        buttonTitle: msg.buttonTitle || '',
                        buttonUrl: msg.buttonUrl || '',
                        notificationMessagesCtaText: msg.notificationMessagesCtaText || NotificationMessagesCtaEnum.GET_UPDATES
                    }
                }
            })
            setPageName(foundPageName)
            setForm(updated)
        }
    }, [settings])

    function handleInputChange(
        type: 'FIRSTMESSAGE' | 'UNSUBSCRIBE',
        field: keyof typeof form.FIRSTMESSAGE,
        value: string | NotificationMessagesCtaEnum
    ) {
        setForm((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }))
    }

    const getErrorMessage = (error: unknown): string => {
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

    async function handleSave(type: 'FIRSTMESSAGE' | 'UNSUBSCRIBE') {
        if (!project) return;

        const existing = settings?.find((s) => s.typeConfiguration === type)
        const currentFormData = form[type];

        let basePayload: Omit<CreatePageSettingsMessagePayload, 'pageId'> = {
            typeConfiguration: type,
            text: currentFormData.text,
        };

        if (type === 'FIRSTMESSAGE') {
            if (isRcnProject) {
                basePayload = {
                    ...basePayload,
                    notificationMessagesCtaText: currentFormData.notificationMessagesCtaText
                };
                delete (basePayload as Partial<CreatePageSettingsMessagePayload>).buttonTitle;
                delete (basePayload as Partial<CreatePageSettingsMessagePayload>).buttonUrl;

            } else {
                if (!currentFormData.buttonTitle || !currentFormData.buttonUrl) {
                    toast.error('Nome do botão e URL são obrigatórios para Broadcast Padrão.');
                    return;
                }
                basePayload = {
                    ...basePayload,
                    buttonTitle: currentFormData.buttonTitle,
                    buttonUrl: currentFormData.buttonUrl
                };
                delete (basePayload as Partial<CreatePageSettingsMessagePayload>).notificationMessagesCtaText;
            }
        } else {
            delete (basePayload as Partial<CreatePageSettingsMessagePayload>).buttonTitle;
            delete (basePayload as Partial<CreatePageSettingsMessagePayload>).buttonUrl;
            delete (basePayload as Partial<CreatePageSettingsMessagePayload>).notificationMessagesCtaText;
        }

        if (existing) {
            if (existing.id === null) {
                toast.error('Erro: ID da configuração existente é inválido.');
                console.error('Inconsistent state: existing setting found but id is null', existing);
                return;
            }
            const updatePayload: UpdatePageSettingsMessagePayload = basePayload;

            update.mutate(
                {
                    id: existing.id,
                    data: updatePayload,
                    pageId: parsedPageId
                },
                {
                    onSuccess: () => {
                        toast.success('Alterações salvas com sucesso!')
                        refetch()
                    },
                    onError: (error: unknown) => {
                        toast.error(getErrorMessage(error))
                    }
                }
            )
        } else {
            const createPayload: CreatePageSettingsMessagePayload = {
                ...basePayload,
                pageId: parsedPageId
            };

            create.mutate(createPayload, {
                onSuccess: () => {
                    toast.success('Mensagem criada com sucesso!')
                    refetch()
                },
                onError: (error: unknown) => {
                    toast.error(getErrorMessage(error))
                }
            })
        }
    }

    function handleDelete(type: 'FIRSTMESSAGE' | 'UNSUBSCRIBE') {
        const target = settings?.find((s) => s.typeConfiguration === type)
        if (!target?.id) return

        if (confirm('Deseja realmente excluir essa configuração?')) {
            remove.mutate(
                { id: target.id, pageId: parsedPageId },
                {
                    onSuccess: () => {
                        toast.success('Configuração excluída!')
                        refetch()
                    },
                    onError: (error: unknown) => {
                        toast.error(getErrorMessage(error))
                    }
                }
            )
        }
    }


    if (isLoadingProject || isLoadingSettings) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 text-white">
            <button
                onClick={() => router.back()}
                className="text-sm bg-gray-800 border border-gray-700 px-3 py-1 rounded hover:bg-gray-700"
            >
                ← Voltar
            </button>

            <h1 className="text-3xl font-bold">Configuração de mensagens - {pageName}</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {(['FIRSTMESSAGE', 'UNSUBSCRIBE'] as const).map((type) => (
                    <div key={type} className="bg-gray-800 p-6 rounded space-y-4 border border-gray-700 shadow-lg">
                        <h2 className="text-xl font-bold">
                            {type === 'FIRSTMESSAGE' ? 'First message' : 'Un-subscribe'}
                        </h2>

                        <div>
                            <label htmlFor={`${type}_text`} className="text-sm block mb-1">
                                {type === 'FIRSTMESSAGE' && isRcnProject ? 'Título do convite*' : 'Insira sua resposta automática*'}
                            </label>
                            <textarea
                                id={`${type}_text`}
                                className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                                value={form[type].text}
                                onChange={(e) => handleInputChange(type, 'text', e.target.value)}
                            />
                        </div>

                        {type === 'FIRSTMESSAGE' && (
                            <>
                                {!isRcnProject && (
                                    <>
                                        <div>
                                            <label htmlFor={`${type}_buttonTitle`} className="text-sm block mb-1">Nome do botão*</label>
                                            <input
                                                id={`${type}_buttonTitle`}
                                                type="text"
                                                className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                                value={form[type].buttonTitle}
                                                onChange={(e) => handleInputChange(type, 'buttonTitle', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`${type}_buttonUrl`} className="text-sm block mb-1">URL*</label>
                                            <input
                                                id={`${type}_buttonUrl`}
                                                type="url"
                                                className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                                value={form[type].buttonUrl}
                                                onChange={(e) => handleInputChange(type, 'buttonUrl', e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {isRcnProject && (
                                    <div>
                                        <label htmlFor={`${type}_ctaText`} className="text-sm block mb-1">Texto do botão de aceite*</label>
                                        <select
                                            id={`${type}_ctaText`}
                                            className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                            value={form[type].notificationMessagesCtaText}
                                            onChange={(e) => handleInputChange(type, 'notificationMessagesCtaText', e.target.value as NotificationMessagesCtaEnum)}
                                        >
                                            {Object.entries(ctaTextDisplay).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => handleDelete(type)}
                                className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
                                disabled={remove.isPending || !settings?.find(s => s.typeConfiguration === type)?.id}
                            >
                                Excluir
                            </button>
                            <button
                                onClick={() => handleSave(type)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
                                disabled={create.isPending || update.isPending}
                            >
                                {create.isPending || update.isPending ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}