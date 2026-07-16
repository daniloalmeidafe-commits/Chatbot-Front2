'use client'

import { useState, Fragment } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAutomations, useExportAutomation, useDeleteAutomation, useUpdateAutomation, Automation } from '@/hooks/useAutomations'
import { ImportAutomationModal } from '@/components/ImportAutomationModal'
import { Plus, UploadCloud, Copy, MoreVertical, Loader2, Workflow, Pencil, Trash2, CheckCircle, XCircle, PlayCircle, PauseCircle } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { useSweetAlert } from '@/utils/useSweetAlert'

export default function AutomationsPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const router = useRouter();
    const { confirmDelete } = useSweetAlert();

    const { data: automations, isLoading } = useAutomations(Number(projectId));
    const exportMutation = useExportAutomation();
    const deleteMutation = useDeleteAutomation();
    const updateMutation = useUpdateAutomation();

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleExport = (automationId: number) => {
        exportMutation.mutate(automationId);
    };

    const handleDelete = async (automationId: number, automationName: string) => {
        const confirmed = await confirmDelete(`Deseja realmente excluir a automação "${automationName}"?`);
        if (confirmed) {
            deleteMutation.mutate(automationId);
        }
    };

    const handleStatusToggle = (automation: Automation) => {
        const newStatus = automation.status === 'enabled' ? 'disabled' : 'enabled';
        updateMutation.mutate({
            id: automation.id,
            payload: { status: newStatus }
        });
    };

    return (
        <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Automações do Projeto</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                    >
                        <UploadCloud className="w-5 h-5" />
                        Importar
                    </button>
                    <button
                        onClick={() => router.push(`/projects/${projectId}/automations/new`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Automação
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : automations && automations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {automations.map((automation) => (
                        <div key={automation.id} className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col group relative hover:border-blue-500 transition-colors duration-200">
                            <div className="absolute top-2 right-2 z-10">
                                <Menu as="div" className="relative inline-block text-left">
                                    <Menu.Button className="p-2 rounded-full hover:bg-gray-700 text-gray-400">
                                        <MoreVertical className="w-5 h-5"/>
                                    </Menu.Button>
                                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-gray-900 shadow-lg border border-gray-700">
                                            <div className="px-1 py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button onClick={() => router.push(`/projects/${projectId}/automations/${automation.id}/flowbuilder`)} className={`${active ? 'bg-blue-600' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Editar Fluxo
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button onClick={() => handleStatusToggle(automation)} className={`${active ? 'bg-blue-600' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}>
                                                            {automation.status === 'enabled' ?
                                                                <><PauseCircle className="mr-2 h-4 w-4" /> Pausar Automação</> :
                                                                <><PlayCircle className="mr-2 h-4 w-4" /> Ativar Automação</>
                                                            }
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button onClick={() => handleExport(automation.id)} className={`${active ? 'bg-blue-600' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}>
                                                            <Copy className="mr-2 h-4 w-4" /> Exportar (Copiar JSON)
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button onClick={() => handleDelete(automation.id, automation.name)} className={`${active ? 'bg-red-600' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>

                            <div className="p-5 flex-grow cursor-pointer" onClick={() => router.push(`/projects/${projectId}/automations/${automation.id}/flowbuilder`)}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-900/70">
                                        <Workflow className="w-5 h-5 text-indigo-400"/>
                                    </div>
                                    <h3 className="font-bold text-lg text-white truncate group-hover:text-indigo-400 transition-colors">{automation.name}</h3>
                                </div>
                                <p className="text-sm text-gray-400">ID: {automation.id}</p>
                            </div>

                            <div className="border-t border-gray-700 bg-gray-900/30 px-5 py-3">
                                {automation.status === 'enabled' ? (
                                    <span className="inline-flex items-center gap-1.5 text-green-300 font-semibold text-xs">
                                        <CheckCircle className="w-4 h-4" /> Ativa
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-yellow-300 font-semibold text-xs">
                                        <XCircle className="w-4 h-4" /> Pausada
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl mt-8">
                    <Workflow className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">Nenhuma automação criada</h3>
                    <p className="mt-1 text-sm text-gray-400">Clique em Nova Automação para criar seu primeiro fluxo.</p>
                </div>
            )}

            <ImportAutomationModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                projectId={Number(projectId)}
            />
        </div>
    )
}
