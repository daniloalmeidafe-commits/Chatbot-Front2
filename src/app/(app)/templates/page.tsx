'use client'

import { useState, useMemo } from 'react'
import {
    useGetPageTemplateSettings,
    useDeletePageTemplateSetting,
    useCreatePageTemplateSetting,
    PageTemplateSetting,
    CreatePageTemplateSettingPayload,
    TemplateTypeEnum,
    NotificationMessagesCtaEnum
} from '@/hooks/usePageTemplateSettings'
import { useAuthStore } from '@/store/authStore'
import { Plus, Loader2, FileText, Search, Filter } from 'lucide-react'
import { useSweetAlert } from '@/utils/useSweetAlert'
import { TemplateCard } from '@/components/TemplateCard'
import { TemplateModal } from '@/components/TemplateModal'
import { TemplateDetailsSidebar } from '@/components/TemplateDetailsSidebar'
import { toast } from 'react-toastify'

export default function TemplatesPage() {
    const userId = useAuthStore((s) => s.user?.id)
    const { data: allTemplates, isLoading } = useGetPageTemplateSettings(userId)
    const deleteMutation = useDeletePageTemplateSetting()
    const createMutation = useCreatePageTemplateSetting()
    const { confirmDelete } = useSweetAlert()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<PageTemplateSetting | null>(null)
    const [viewingTemplate, setViewingTemplate] = useState<PageTemplateSetting | null>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'all' | TemplateTypeEnum>('all')

    const filteredTemplates = useMemo(() => {
        if (!allTemplates) return [];
        return allTemplates.filter(template => {
            const nameMatch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = filterType === 'all' || template.templateType === filterType;
            return nameMatch && typeMatch;
        });
    }, [allTemplates, searchTerm, filterType]);


    const openModal = (template?: PageTemplateSetting) => {
        setEditingTemplate(template || null)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingTemplate(null)
    }

    const handleDelete = async (templateId: number, templateName: string) => {
        const confirmed = await confirmDelete(`Deseja realmente excluir o template "${templateName}"?`);
        if (confirmed) {
            deleteMutation.mutate(templateId);
        }
    }

    const handleDuplicate = (template: PageTemplateSetting) => {
        if (!userId) return;

        const newTemplateData: CreatePageTemplateSettingPayload = {
            name: `${template.name} (Cópia)`,
            description: template.description || '',
            payloadFirstMessageText: template.payloadFirstMessageText || '',
            payloadUnsubscribeText: template.payloadUnsubscribeText || '',
            stopKeywords: template.stopKeywords || '',
            stopKeyWordsComments: template.stopKeyWordsComments || '',
            commentAutoReply: template.commentAutoReply || '',
            userId: userId,
            templateType: template.templateType,
        };

        if (template.templateType === TemplateTypeEnum.RCN) {
            newTemplateData.notificationMessagesCtaText = template.notificationMessagesCtaText || NotificationMessagesCtaEnum.GET_UPDATES;
        } else {
            newTemplateData.payloadFirstMessageButtonTitle = template.payloadFirstMessageButtonTitle || '';
            newTemplateData.payloadFirstMessageButtonUrl = template.payloadFirstMessageButtonUrl || '';
        }

        createMutation.mutate(newTemplateData, {
            onSuccess: () => {
                toast.success(`Template "${template.name}" duplicado com sucesso!`);
            }
        });
    };

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-white">Templates de Configuração</h1>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            className="pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative flex-shrink-0">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                            className="pl-10 pr-8 py-2 appearance-none rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as 'all' | TemplateTypeEnum)}
                        >
                            <option value="all">Todos os Tipos</option>
                            <option value={TemplateTypeEnum.BROADCAST_STANDARD}>Broadcast Padrão</option>
                            <option value={TemplateTypeEnum.RCN}>RCN</option>
                        </select>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Template
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            )}

            {!isLoading && filteredTemplates && filteredTemplates.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTemplates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onClick={() => setViewingTemplate(template)}
                            onEdit={() => openModal(template)}
                            onDelete={() => handleDelete(template.id, template.name)}
                            onDuplicate={() => handleDuplicate(template)}
                        />
                    ))}
                </div>
            )}

            {!isLoading && (!filteredTemplates || filteredTemplates.length === 0) && (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl mt-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">
                        {searchTerm || filterType !== 'all' ? 'Nenhum template encontrado' : 'Nenhum template criado'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                        {searchTerm || filterType !== 'all' ? 'Tente ajustar sua busca.' : 'Clique em Novo Template para criar seu primeiro modelo de configuração.'}
                    </p>
                </div>
            )}

            <TemplateModal
                isOpen={isModalOpen}
                onClose={closeModal}
                template={editingTemplate}
            />

            <TemplateDetailsSidebar
                template={viewingTemplate}
                onClose={() => setViewingTemplate(null)}
            />
        </div>
    )
}