'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useProjectById, useUpdateProject } from '@/hooks/useProjects'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ToggleSwitch } from '@/components/ToggleSwitch'
import { toast } from 'react-toastify'
import { ProjectSidebarNav } from '@/components/ProjectSidebarNav'
import { AxiosError } from 'axios'

export default function ProjectEditPage() {
    const { id } = useParams<{ id: string }>()
    const projectId = Number(id)
    const router = useRouter()

    const { data: project, isLoading: isLoadingProject } = useProjectById(projectId)
    const updateProject = useUpdateProject()

    const [form, setForm] = useState({
        name: '',
        description: '',
        statusBroadcast: false,
        meta_pixel_id: '',
        meta_capi_access_token: '',
    })
    const [isRcn, setIsRcn] = useState<boolean>(false)

    useEffect(() => {
        if (project) {
            setForm({
                name: project.name,
                description: project.description || '',
                statusBroadcast: project.statusBroadcast === 'enabled',
                meta_pixel_id: project.meta_pixel_id || '',
                meta_capi_access_token: project.meta_capi_access_token || '',
            })
            const isProjectTypeRcn = project.project_type === 'RCN';
            setIsRcn(isProjectTypeRcn);
        }
    }, [project])

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

    function handleSubmit() {
        updateProject.mutate(
            {
                id: projectId,
                payload: {
                    name: form.name,
                    description: form.description,
                    statusBroadcast: form.statusBroadcast ? 'enabled' : 'disabled',
                    meta_pixel_id: form.meta_pixel_id,
                    meta_capi_access_token: form.meta_capi_access_token,
                },
            },
            {
                onSuccess: () => {
                    toast.success('Projeto salvo com sucesso!')
                },
                onError: (error: unknown) => {
                    toast.error(getErrorMessage(error))
                },
            }
        )
    }

    if (isLoadingProject) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="p-6 text-white">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>
                <p>Projeto não encontrado.</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar
            </button>

            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-white">
                    Configuração do projeto – {form.name}
                </h1>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${isRcn ? 'bg-purple-600 text-purple-100' : 'bg-blue-600 text-blue-100'}`}>
                    {isRcn ? 'RCN' : 'Broadcast Padrão'}
                </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <ProjectSidebarNav />

                <div className="flex-1 bg-gray-800 p-6 rounded-xl space-y-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white">Editar Projeto</h2>

                    <input type="text" style={{ display: 'none' }} />
                    <input type="password" style={{ display: 'none' }} />

                    <div>
                        <label htmlFor="projectName" className="block mb-1 text-sm font-medium text-gray-300">Nome do Projeto</label>
                        <input
                            id="projectName"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="projectDescription" className="block mb-1 text-sm font-medium text-gray-300">Descrição</label>
                        <textarea
                            id="projectDescription"
                            rows={3}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="metaPixelId" className="block mb-1 text-sm font-medium text-gray-300">Meta Pixel ID</label>
                        <input
                            id="metaPixelId"
                            name="meta_pixel_id_field"
                            autoComplete="off"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                            value={form.meta_pixel_id}
                            onChange={(e) => setForm({ ...form, meta_pixel_id: e.target.value })}
                            placeholder="Ex: 1234567890123456"
                        />
                    </div>

                    <div>
                        <label htmlFor="metaCapiToken" className="block mb-1 text-sm font-medium text-gray-300">Meta CAPI Access Token</label>
                        <input
                            id="metaCapiToken"
                            type="password"
                            name="meta_capi_token_field"
                            autoComplete="new-password"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                            value={form.meta_capi_access_token}
                            onChange={(e) => setForm({ ...form, meta_capi_access_token: e.target.value })}
                            placeholder="Cole seu token de acesso aqui"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label htmlFor="statusBroadcastToggle" className="text-sm font-medium text-gray-300">Status de Broadcast do Projeto</label>
                        <ToggleSwitch
                            checked={form.statusBroadcast}
                            onChange={(value) =>
                                setForm({ ...form, statusBroadcast: value })
                            }
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={updateProject.isPending}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold disabled:opacity-50 flex items-center gap-2"
                        >
                            {updateProject.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Salvar projeto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}