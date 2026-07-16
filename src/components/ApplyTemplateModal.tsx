'use client'

import { Dialog, Transition, RadioGroup } from '@headlessui/react'
import { Fragment, useState, useEffect, useMemo } from 'react'
import {
    useGetPageTemplateSettings,
    useApplyPageTemplateSetting,
    TemplateTypeEnum
} from '@/hooks/usePageTemplateSettings'
import { useAuthStore } from '@/store/authStore'
import { Loader2, CheckCircle, FilePlus, Bell, Megaphone, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ApplyTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    pageIds: number[];
    projectType: 'BroadcastStandard' | 'RCN' | undefined;
}

export function ApplyTemplateModal({ isOpen, onClose, pageIds, projectType }: ApplyTemplateModalProps) {
    const router = useRouter();
    const userId = useAuthStore(s => s.user?.id)
    const { data: allTemplates, isLoading: isLoadingTemplates } = useGetPageTemplateSettings(userId)
    const applyTemplateMutation = useApplyPageTemplateSetting()

    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setSelectedTemplateId(null);
            setSearchTerm('');
        }
    }, [isOpen]);

    const filteredTemplates = useMemo(() => {
        if (!allTemplates || !projectType) return [];

        const targetType = projectType === 'RCN'
            ? TemplateTypeEnum.RCN
            : TemplateTypeEnum.BROADCAST_STANDARD;

        const typeFiltered = allTemplates.filter(template => template.templateType === targetType);

        if (!searchTerm) {
            return typeFiltered;
        }

        return typeFiltered.filter(template =>
            template.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [allTemplates, projectType, searchTerm]);

    const handleSubmit = () => {
        if (!selectedTemplateId || pageIds.length === 0) return

        applyTemplateMutation.mutate(
            { templateId: selectedTemplateId, pageIds },
            {
                onSuccess: () => {
                    onClose()
                }
            }
        )
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white">
                                    Aplicar Template de Configuração
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-400">
                                        Selecione um template para aplicar às {pageIds.length} página(s) selecionada(s). As configurações serão substituídas.
                                    </p>
                                    {projectType && (
                                        <p className="text-sm text-gray-400 mt-1">
                                            Mostrando apenas templates do tipo:
                                            <span className={`ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${projectType === 'RCN' ? 'bg-purple-600 text-purple-100' : 'bg-blue-600 text-blue-100'}`}>
                                                {projectType === 'RCN' ? 'RCN' : 'Broadcast Padrão'}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar template por nome..."
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 max-h-64 overflow-y-auto pr-2">
                                    {isLoadingTemplates ? (
                                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-white"/></div>
                                    ) : filteredTemplates && filteredTemplates.length > 0 ? (
                                        <RadioGroup value={selectedTemplateId} onChange={setSelectedTemplateId}>
                                            <div className="space-y-2">
                                                {filteredTemplates.map((template) => (
                                                    <RadioGroup.Option
                                                        key={template.id}
                                                        value={template.id}
                                                        className={({ active, checked }) =>
                                                            `${active ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-blue-400' : ''}
                                                            ${checked ? 'bg-blue-900/75 text-white' : 'bg-gray-900/50'}
                                                            relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                                                        }
                                                    >
                                                        {({ checked }) => (
                                                            <div className="flex w-full items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    {template.templateType === TemplateTypeEnum.RCN
                                                                        ? <Bell className={`w-5 h-5 flex-shrink-0 ${checked ? 'text-white' : 'text-purple-400'}`} />
                                                                        : <Megaphone className={`w-5 h-5 flex-shrink-0 ${checked ? 'text-white' : 'text-blue-400'}`} />
                                                                    }
                                                                    <div className="text-sm">
                                                                        <RadioGroup.Label as="p" className={`font-medium ${checked ? 'text-white' : 'text-gray-300'}`}>
                                                                            {template.name}
                                                                        </RadioGroup.Label>
                                                                        <RadioGroup.Description as="span" className={`inline ${checked ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                            <span>{template.description}</span>
                                                                        </RadioGroup.Description>
                                                                    </div>
                                                                </div>
                                                                {checked && (
                                                                    <div className="flex-shrink-0 text-white">
                                                                        <CheckCircle className="h-6 w-6" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </RadioGroup.Option>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    ) : (
                                        <div className="text-center py-8 px-4 border-2 border-dashed border-gray-700 rounded-lg">
                                            <FilePlus className="mx-auto h-10 w-10 text-gray-500" />
                                            <h3 className="mt-2 text-md font-medium text-white">
                                                {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template compatível encontrado'}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-400">
                                                {searchTerm
                                                    ? 'Tente um termo de busca diferente.'
                                                    : `Crie um template do tipo '${projectType === 'RCN' ? 'RCN' : 'Broadcast Padrão'}' para aplicá-lo aqui.`}
                                            </p>
                                            <button
                                                onClick={() => router.push('/templates')}
                                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                Ir para Templates
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold text-white">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!selectedTemplateId || applyTemplateMutation.isPending}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white disabled:bg-blue-800/50"
                                    >
                                        {applyTemplateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
                                        Aplicar Template
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