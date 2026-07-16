import { Dialog, Transition } from '@headlessui/react'
import { useEffect, useState, Fragment } from 'react'
import {
    useCreatePageTemplateSetting,
    useUpdatePageTemplateSetting,
    PageTemplateSetting,
    TemplateTypeEnum,
    NotificationMessagesCtaEnum,
    CreatePageTemplateSettingPayload,
    UpdatePageTemplateSettingPayload
} from '@/hooks/usePageTemplateSettings'
import { useAuthStore } from '@/store/authStore'
import { Loader2, MessageSquarePlus, UserX, Info } from 'lucide-react'
import { toast } from 'react-toastify'

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: PageTemplateSetting | null;
}

const ctaTextDisplay: Record<NotificationMessagesCtaEnum, string> = {
    [NotificationMessagesCtaEnum.ALLOW]: "Permitir mensagens",
    [NotificationMessagesCtaEnum.GET]: "Receber mensagens",
    [NotificationMessagesCtaEnum.GET_UPDATES]: "Receber atualizações",
    [NotificationMessagesCtaEnum.OPT_IN]: "Aceitar mensagens",
    [NotificationMessagesCtaEnum.SIGN_UP]: "Cadastre-se para receber mensagens",
};

const initialState = {
    name: '',
    description: '',
    templateType: TemplateTypeEnum.BROADCAST_STANDARD,
    payloadFirstMessageText: '',
    payloadFirstMessageButtonTitle: '',
    payloadFirstMessageButtonUrl: '',
    notificationMessagesCtaText: NotificationMessagesCtaEnum.GET_UPDATES,
    payloadUnsubscribeText: '',
    stopKeywords: '',
    stopKeyWordsComments: '',
    commentAutoReply: '',
}

export function TemplateModal({ isOpen, onClose, template }: TemplateModalProps) {
    const userId = useAuthStore(s => s.user?.id)
    const [form, setForm] = useState(initialState)

    const createMutation = useCreatePageTemplateSetting()
    const updateMutation = useUpdatePageTemplateSetting()

    const isLoading = createMutation.isPending || updateMutation.isPending
    const isRcnTemplate = form.templateType === TemplateTypeEnum.RCN;

    useEffect(() => {
        if (template) {
            setForm({
                name: template.name || '',
                description: template.description || '',
                templateType: template.templateType || TemplateTypeEnum.BROADCAST_STANDARD,
                payloadFirstMessageText: template.payloadFirstMessageText || '',
                payloadFirstMessageButtonTitle: template.payloadFirstMessageButtonTitle || '',
                payloadFirstMessageButtonUrl: template.payloadFirstMessageButtonUrl || '',
                notificationMessagesCtaText: template.notificationMessagesCtaText || NotificationMessagesCtaEnum.GET_UPDATES,
                payloadUnsubscribeText: template.payloadUnsubscribeText || '',
                stopKeywords: template.stopKeywords || '',
                stopKeyWordsComments: template.stopKeyWordsComments || '',
                commentAutoReply: template.commentAutoReply || '',
            })
        } else {
            setForm(initialState)
        }
    }, [template, isOpen])

    const handleSubmit = () => {
        if (!userId) {
            toast.error("Usuário não autenticado.");
            return;
        }

        let basePayload: Omit<CreatePageTemplateSettingPayload, 'userId'> = {
            name: form.name,
            description: form.description,
            templateType: form.templateType,
            payloadFirstMessageText: form.payloadFirstMessageText,
            payloadUnsubscribeText: form.payloadUnsubscribeText,
            stopKeywords: form.stopKeywords,
            stopKeyWordsComments: form.stopKeyWordsComments,
            commentAutoReply: form.commentAutoReply,
        };

        if (isRcnTemplate) {
            if (!form.notificationMessagesCtaText) {
                toast.error('O texto do botão de aceite é obrigatório para templates RCN.');
                return;
            }
            basePayload = {
                ...basePayload,
                notificationMessagesCtaText: form.notificationMessagesCtaText
            };
            delete (basePayload as Partial<CreatePageTemplateSettingPayload>).payloadFirstMessageButtonTitle;
            delete (basePayload as Partial<CreatePageTemplateSettingPayload>).payloadFirstMessageButtonUrl;
        } else {
            if (!form.payloadFirstMessageButtonTitle || !form.payloadFirstMessageButtonUrl) {
                toast.error('Título e URL do botão são obrigatórios para templates Broadcast Padrão.');
                return;
            }
            basePayload = {
                ...basePayload,
                payloadFirstMessageButtonTitle: form.payloadFirstMessageButtonTitle,
                payloadFirstMessageButtonUrl: form.payloadFirstMessageButtonUrl
            };
            delete (basePayload as Partial<CreatePageTemplateSettingPayload>).notificationMessagesCtaText;
        }


        if (template) {
            updateMutation.mutate({ id: template.id, payload: basePayload as UpdatePageTemplateSettingPayload }, { onSuccess: onClose })
        } else {
            createMutation.mutate({ ...basePayload, userId } as CreatePageTemplateSettingPayload, { onSuccess: onClose })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value as TemplateTypeEnum | NotificationMessagesCtaEnum }))
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700 text-white">
                                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white mb-6">
                                    {template ? 'Editar Template' : 'Novo Template de Configuração'}
                                </Dialog.Title>

                                <div className="space-y-6">
                                    <div className="space-y-4 rounded-lg bg-gray-900/50 p-4 border border-gray-700">
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <Info className="w-5 h-5 text-gray-400"/>Informações Gerais
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-1">
                                                <label htmlFor="templateName" className="block mb-1 text-sm font-medium text-gray-300">Nome do Template*</label>
                                                <input id="templateName" name="name" value={form.name} onChange={handleInputChange} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                                            </div>
                                            <div className="md:col-span-1">
                                                <label htmlFor="templateDescription" className="block mb-1 text-sm font-medium text-gray-300">Descrição</label>
                                                <input id="templateDescription" name="description" value={form.description} onChange={handleInputChange} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                                            </div>
                                            <div className="md:col-span-1">
                                                <label htmlFor="templateType" className="block mb-1 text-sm font-medium text-gray-300">Tipo de Template*</label>
                                                <select
                                                    id="templateType"
                                                    name="templateType"
                                                    value={form.templateType}
                                                    onChange={handleSelectChange}
                                                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                                    disabled={!!template}
                                                >
                                                    <option value={TemplateTypeEnum.BROADCAST_STANDARD}>Broadcast Padrão</option>
                                                    <option value={TemplateTypeEnum.RCN}>Notificação Recorrente (RCN)</option>
                                                </select>
                                                {!!template && <p className="text-xs text-gray-400 mt-1">O tipo não pode ser alterado após a criação.</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 rounded-lg bg-gray-900/50 p-4 border border-gray-700">
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <MessageSquarePlus className="w-5 h-5 text-blue-400"/>Mensagem de Boas-Vindas
                                        </h3>
                                        <div>
                                            <label htmlFor="payloadFirstMessageText" className="block mb-1 text-sm font-medium text-gray-300">
                                                {isRcnTemplate ? 'Título do Convite*' : 'Texto da Mensagem*'}
                                            </label>
                                            <textarea id="payloadFirstMessageText" name="payloadFirstMessageText" value={form.payloadFirstMessageText} onChange={handleInputChange} rows={4} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                                        </div>

                                        {!isRcnTemplate && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="payloadFirstMessageButtonTitle" className="block mb-1 text-sm font-medium text-gray-300">Título do Botão*</label>
                                                    <input id="payloadFirstMessageButtonTitle" name="payloadFirstMessageButtonTitle" value={form.payloadFirstMessageButtonTitle} onChange={handleInputChange} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                                                </div>
                                                <div>
                                                    <label htmlFor="payloadFirstMessageButtonUrl" className="block mb-1 text-sm font-medium text-gray-300">URL do Botão*</label>
                                                    <input id="payloadFirstMessageButtonUrl" name="payloadFirstMessageButtonUrl" type="url" value={form.payloadFirstMessageButtonUrl} onChange={handleInputChange} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                                                </div>
                                            </div>
                                        )}

                                        {isRcnTemplate && (
                                            <div>
                                                <label htmlFor="notificationMessagesCtaText" className="block mb-1 text-sm font-medium text-gray-300">Texto do Botão de Aceite*</label>
                                                <select
                                                    id="notificationMessagesCtaText"
                                                    name="notificationMessagesCtaText"
                                                    value={form.notificationMessagesCtaText}
                                                    onChange={handleSelectChange}
                                                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    {Object.entries(ctaTextDisplay).map(([key, value]) => (
                                                        <option key={key} value={key as NotificationMessagesCtaEnum}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 rounded-lg bg-gray-900/50 p-4 border border-gray-700">
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <UserX className="w-5 h-5 text-yellow-400"/>Configurações de Desinscrição & Comentários
                                        </h3>

                                        <div>
                                            <label htmlFor="payloadUnsubscribeText" className="block mb-1 text-sm font-medium text-gray-300">Mensagem de Confirmação de Desinscrição*</label>
                                            <input id="payloadUnsubscribeText" name="payloadUnsubscribeText" value={form.payloadUnsubscribeText} onChange={handleInputChange} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="stopKeywords" className="block mb-1 text-sm font-medium text-gray-300">Palavras-chave de Parada*</label>
                                                <input
                                                    id="stopKeywords"
                                                    name="stopKeywords"
                                                    value={form.stopKeywords}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: parar, sair, cancelar (separado por vírgula)"
                                                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="stopKeyWordsComments" className="block mb-1 text-sm font-medium text-gray-300">Frases para moderar comentários</label>
                                                <input
                                                    id="stopKeyWordsComments"
                                                    name="stopKeyWordsComments"
                                                    value={form.stopKeyWordsComments}
                                                    onChange={handleInputChange}
                                                    placeholder="Ex: perfil fake, isso é falso (separado por vírgula)"
                                                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="commentAutoReply" className="block mb-1 text-sm font-medium text-gray-300">
                                                Resposta automática no inbox (quando comentário NÃO for moderado)
                                            </label>
                                            <textarea
                                                id="commentAutoReply"
                                                name="commentAutoReply"
                                                value={form.commentAutoReply}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder="Ex.: Olá, obrigado pelo seu comentário! Posso te ajudar por inbox?"
                                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold text-white">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white disabled:opacity-50"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Salvar Template
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}