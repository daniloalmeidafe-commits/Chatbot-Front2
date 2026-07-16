import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X, Info, MessageSquarePlus, UserX, Type } from 'lucide-react'
import { PageTemplateSetting, TemplateTypeEnum, NotificationMessagesCtaEnum } from '@/hooks/usePageTemplateSettings'

interface SidebarProps {
    template: PageTemplateSetting | null;
    onClose: () => void;
}

const ctaTextDisplay: Record<NotificationMessagesCtaEnum, string> = {
    [NotificationMessagesCtaEnum.ALLOW]: "Permitir mensagens",
    [NotificationMessagesCtaEnum.GET]: "Receber mensagens",
    [NotificationMessagesCtaEnum.GET_UPDATES]: "Receber atualizações",
    [NotificationMessagesCtaEnum.OPT_IN]: "Aceitar mensagens",
    [NotificationMessagesCtaEnum.SIGN_UP]: "Cadastre-se para receber mensagens",
};

const DetailItem = ({ label, value }: { label: string, value: string | undefined | null }) => {
    if (!value) return null;
    return (
        <div>
            <p className="text-sm font-medium text-gray-400">{label}</p>
            <p className="text-base text-white whitespace-pre-wrap">{value}</p>
        </div>
    )
}

export function TemplateDetailsSidebar({ template, onClose }: SidebarProps) {

    const isRcn = template?.templateType === TemplateTypeEnum.RCN;
    const ctaText = template?.notificationMessagesCtaText ? ctaTextDisplay[template.notificationMessagesCtaText] : null;

    return (
        <Transition show={!!template} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300 sm:duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300 sm:duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-gray-800 text-white shadow-xl border-l border-gray-700">
                                        <div className="bg-gray-900/50 p-4">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-lg font-bold">
                                                    Detalhes do Template
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="rounded-md p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                                        onClick={onClose}
                                                    >
                                                        <X className="h-6 w-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative flex-1 p-6 space-y-6">
                                            <div className="space-y-4 rounded-lg bg-gray-900/50 p-4 border border-gray-700">
                                                <h3 className="font-semibold text-white flex items-center gap-2">
                                                    <Info className="w-5 h-5 text-gray-400" />
                                                    Informações Gerais
                                                </h3>
                                                <DetailItem label="Nome" value={template?.name} />
                                                <DetailItem label="Descrição" value={template?.description} />
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Type className="w-5 h-5 text-gray-400" />
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${isRcn ? 'bg-purple-600 text-purple-100' : 'bg-blue-600 text-blue-100'}`}>
                                                        {isRcn ? 'RCN' : 'Broadcast Padrão'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 rounded-lg bg-gray-900/50 p-4 border border-gray-700">
                                                <h3 className="font-semibold text-white flex items-center gap-2">
                                                    <MessageSquarePlus className="w-5 h-5 text-blue-400" />
                                                    Mensagem de Boas-Vindas
                                                </h3>
                                                <DetailItem label={isRcn ? "Título do Convite" : "Texto da Mensagem"} value={template?.payloadFirstMessageText} />
                                                {!isRcn && (
                                                    <>
                                                        <DetailItem label="Título do Botão" value={template?.payloadFirstMessageButtonTitle} />
                                                        <DetailItem label="URL do Botão" value={template?.payloadFirstMessageButtonUrl} />
                                                    </>
                                                )}
                                                {isRcn && (
                                                    <DetailItem label="Texto do Botão de Aceite" value={ctaText} />
                                                )}
                                            </div>

                                            <div className="space-y-4 rounded-lg bg-gray-900/50 p-4 border border-gray-700">
                                                <h3 className="font-semibold text-white flex items-center gap-2">
                                                    <UserX className="w-5 h-5 text-yellow-400" />
                                                    Configuração de Desinscrição
                                                </h3>
                                                <DetailItem label="Mensagem de Confirmação" value={template?.payloadUnsubscribeText} />
                                                <DetailItem label="Palavras-chave de Parada" value={template?.stopKeywords} />
                                            </div>

                                            <div className="space-y-4 rounded-lg bg-gray-900/50 p-4 border border-gray-700">
                                                <h3 className="font-semibold text-white flex items-center gap-2">
                                                    <Info className="w-5 h-5 text-gray-400" />
                                                    Moderação de Comentários
                                                </h3>
                                                <DetailItem
                                                    label="Frases para moderar comentários"
                                                    value={template?.stopKeyWordsComments ?? ''}
                                                />
                                                <DetailItem
                                                    label="Resposta automática no inbox (comentários)"
                                                    value={template?.commentAutoReply ?? ''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}