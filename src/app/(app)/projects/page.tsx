'use client'

import {
    useProjects,
    useCreateProject,
    useUpdateProject,
    useDeleteProject,
    Project,
} from '@/hooks/useProjects'
import { useAuthStore } from '@/store/authStore'
import { useState, useMemo } from 'react'
import { Plus, Folder, Loader2, Search, Filter } from 'lucide-react' // Importar Search e Filter
import { Dialog } from '@headlessui/react'
import { useSweetAlert } from '@/utils/useSweetAlert'
import { ProjectCard } from '@/components/ProjectCard'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

interface ProjectForm {
    name: string;
    description: string;
    project_type?: 'BroadcastStandard' | 'RCN';
}

export default function ProjectsPage() {
    const { data: allProjects, isLoading } = useProjects()
    const createProject = useCreateProject()
    const updateProject = useUpdateProject()
    const deleteProject = useDeleteProject()
    const { confirmDelete } = useSweetAlert()
    const user = useAuthStore((s) => s.user)
    const router = useRouter()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const initialFormState: ProjectForm = { name: '', description: '', project_type: 'BroadcastStandard' }
    const [form, setForm] = useState<ProjectForm>(initialFormState)

    // Estados para os filtros
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'BroadcastStandard' | 'RCN'>('all')

    // Filtra os projetos com base nos estados searchTerm e filterType
    const filteredProjects = useMemo(() => {
        if (!allProjects) return [];
        return allProjects.filter(project => {
            const nameMatch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = filterType === 'all' || project.project_type === filterType;
            return nameMatch && typeMatch;
        });
    }, [allProjects, searchTerm, filterType]);

    function openModal(project?: Project) {
        if (project) {
            setEditingProject(project)
            setForm({ name: project.name, description: project.description })
        } else {
            setEditingProject(null)
            setForm(initialFormState)
        }
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
        setForm(initialFormState)
        setEditingProject(null)
    }

    async function handleDelete(id: number, name: string) {
        const confirmed = await confirmDelete(`Deseja excluir o projeto "${name}"? Todas as suas configurações, perfis e broadcasts serão perdidos.`)
        if (confirmed) {
            deleteProject.mutate(id)
        }
    }

    function handleSubmit() {
        if (editingProject) {
            updateProject.mutate({ id: editingProject.id, payload: { name: form.name, description: form.description } })
        } else {
            if (!user?.id) {
                toast.error("Erro de autenticação. Por favor, faça login novamente.");
                return;
            }
            createProject.mutate({ ...form, userId: user.id })
        }
        closeModal()
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">Projetos</h1>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Filtros */}
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
                            onChange={(e) => setFilterType(e.target.value as 'all' | 'BroadcastStandard' | 'RCN')}
                        >
                            <option value="all">Todos os Tipos</option>
                            <option value="BroadcastStandard">Broadcast Padrão</option>
                            <option value="RCN">RCN</option>
                        </select>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Projeto
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : filteredProjects && filteredProjects.length > 0 ? ( // Usa filteredProjects
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project) => ( // Usa filteredProjects
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={() => router.push(`/projects/${project.id}/settings`)}
                            onDelete={() => handleDelete(project.id, project.name)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl mt-8">
                    <Folder className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">
                        {searchTerm || filterType !== 'all' ? 'Nenhum projeto encontrado com os filtros aplicados.' : 'Nenhum projeto criado'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                        {searchTerm || filterType !== 'all' ? 'Tente ajustar sua busca.' : 'Clique em Novo Projeto para começar.'}
                    </p>
                </div>
            )}

            {/* Modal de Criação */}
            <Dialog open={isModalOpen && !editingProject} onClose={closeModal} className="relative z-50">
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="bg-gray-800 text-white p-6 rounded-xl w-full max-w-md space-y-4 border border-gray-700">
                        <Dialog.Title className="text-xl font-bold">
                            Novo Projeto
                        </Dialog.Title>
                        <div>
                            <label htmlFor="projectName" className="block mb-1 text-sm font-medium text-gray-300">Nome do Projeto</label>
                            <input
                                id="projectName"
                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="projectDescription" className="block mb-1 text-sm font-medium text-gray-300">Descrição</label>
                            <textarea
                                id="projectDescription"
                                rows={3}
                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="projectType" className="block mb-1 text-sm font-medium text-gray-300">Tipo de Projeto</label>
                            <select
                                id="projectType"
                                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={form.project_type}
                                onChange={(e) => setForm({ ...form, project_type: e.target.value as 'BroadcastStandard' | 'RCN' })}
                            >
                                <option value="BroadcastStandard">Broadcast Padrão</option>
                                <option value="RCN">Notificação Recorrente (RCN)</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={createProject.isPending} // Removido updateProject.isPending
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 flex items-center gap-2"
                            >
                                {(createProject.isPending) && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Salvar
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    )
}