'use client'

import {useEffect, useState, Fragment, useMemo} from 'react'
import {
    useBroadcastCopys,
    useDeleteBroadcastCopy,
    useCreateBroadcastCopy,
    useMarkAllBroadcastCopysUnused,
    Copy,
} from '@/hooks/useBroadcastCopys'
import {useBroadcastConfigsList} from '@/hooks/useBroadcastConfig'
import {useProjects} from '@/hooks/useProjects'
import {CopyModal} from '@/components/CopyModal'
import {
    PlusCircle,
    Trash2,
    Pencil,
    Settings,
    Globe,
    Clock,
    Copy as CopyIcon,
    CopyPlusIcon,
    MoreVertical,
    CheckCircle,
    XCircle,
    FileText,
    Image as ImageIcon,
    MessageSquare,
    RotateCcw,
    Filter,
    Loader2
} from 'lucide-react'
import {toast} from 'react-toastify'
import {motion, AnimatePresence} from 'framer-motion'
import {Menu, Transition} from '@headlessui/react'
import Image from 'next/image'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {useSweetAlert} from '@/utils/useSweetAlert'

interface CopyCardProps {
    copy: Copy;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

const CopyCard = ({copy, onEdit, onDelete, onDuplicate}: CopyCardProps) => {
    const isUsed = copy.isUsed === 'yes'
    const isImage = copy.type === 'image'

    return (
        <motion.div
            layout
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.95}}
            transition={{duration: 0.3, ease: 'easeInOut'}}
            className="bg-gray-800 border border-gray-700 rounded-2xl text-white flex flex-col shadow-lg overflow-hidden"
        >
            <div className="p-4 flex justify-between items-center border-b border-gray-700/50">
                <div className="flex items-center gap-4">
                    {isUsed ? (
                        <span
                            className="inline-flex items-center gap-1.5 text-yellow-300 bg-yellow-900/50 px-2.5 py-1 rounded-full text-xs font-semibold">
              <XCircle className="w-3.5 h-3.5"/> Já Usada
            </span>
                    ) : (
                        <span
                            className="inline-flex items-center gap-1.5 text-green-300 bg-green-900/50 px-2.5 py-1 rounded-full text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5"/> Disponível
            </span>
                    )}
                    <span
                        className="inline-flex items-center gap-1.5 text-indigo-300 bg-indigo-900/50 px-2.5 py-1 rounded-full text-xs font-semibold">
            {isImage ? <ImageIcon className="w-3.5 h-3.5"/> : <MessageSquare className="w-3.5 h-3.5"/>}
                        {isImage ? 'Imagem' : 'Texto'}
          </span>
                </div>

                <Menu as="div" className="relative z-10">
                    <Menu.Button className="p-2 -m-2 rounded-full hover:bg-gray-700 text-gray-400">
                        <MoreVertical className="w-5 h-5"/>
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items
                            className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-gray-900 shadow-lg border border-gray-700">
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({active}) => (
                                        <button
                                            onClick={onEdit}
                                            className={`${active ? 'bg-blue-600' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}
                                        >
                                            <Pencil className="mr-2 h-4 w-4"/> Editar
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({active}) => (
                                        <button
                                            onClick={onDuplicate}
                                            className={`${active ? 'bg-blue-600' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}
                                        >
                                            <CopyIcon className="mr-2 h-4 w-4"/> Duplicar
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({active}) => (
                                        <button
                                            onClick={onDelete}
                                            className={`${active ? 'bg-red-600' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4"/> Excluir
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>

            <div className="p-5 flex-grow min-h-[120px] flex flex-col justify-center">
                <p className="text-md font-semibold whitespace-pre-wrap text-white leading-relaxed mb-3">{copy.text}</p>
                {isImage && copy.imageUrl && (
                    <div className="mb-4 relative aspect-video">
                        <Image src={copy.imageUrl} alt="Pré-visualização da Cópia" layout="fill"
                               className="rounded-lg object-cover w-full"/>
                    </div>
                )}
                {isImage && copy.subtitle &&
                    <p className="text-sm whitespace-pre-wrap text-gray-300 leading-relaxed">{copy.subtitle}</p>}
            </div>

            {copy.buttonTitle && (
                <div className="mt-auto border-t border-gray-700 bg-gray-900/30 p-4">
                    <span className="text-xs text-gray-400 block mb-2">Pré-visualização do Botão:</span>
                    <div
                        className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md shadow text-center w-full truncate">
                        {copy.buttonTitle}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

type UsageStatusFilter = 'all' | 'yes' | 'no';

export default function BroadcastCopyPage() {
    const [projectId, setProjectId] = useState<number | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCopy, setEditingCopy] = useState<Copy | null>(null)
    const [markingAll, setMarkingAll] = useState(false)
    const [usageFilter, setUsageFilter] = useState<UsageStatusFilter>('all')
    const {data: projects, isLoading: isLoadingProjects} = useProjects()
    const {data: copys, refetch, isLoading: isLoadingCopys} = useBroadcastCopys(projectId ?? 0)
    const {data: configs, isLoading: isLoadingConfigs} = useBroadcastConfigsList(projectId ?? 0)
    const createCopyMutation = useCreateBroadcastCopy()
    const deleteCopyMutation = useDeleteBroadcastCopy()
    const markAllMutation = useMarkAllBroadcastCopysUnused()
    const {confirmDelete} = useSweetAlert()
    const MySwal = withReactContent(Swal)

    const selectedProject = projects?.find((p) => p.id === projectId)

    const filteredCopys = useMemo(() => {
        if (!copys) return [];
        if (usageFilter === 'all') return copys;
        return copys.filter(copy => copy.isUsed === usageFilter);
    }, [copys, usageFilter]);

    const unusedCount = (copys || []).filter((copy) => copy.isUsed !== 'yes').length
    const hasAnyCopy = !!copys && copys.length > 0
    const isLoading = isLoadingProjects || isLoadingCopys || isLoadingConfigs;

    useEffect(() => {
        if (projects?.length && projectId === null) {
            setProjectId(projects[0].id)
        }
    }, [projects, projectId])

    function closeModal() {
        setIsModalOpen(false)
        setEditingCopy(null)
        refetch()
    }

    const handleDuplicate = (copyToDuplicate: Copy) => {
        if (!projectId) return
        createCopyMutation.mutate(
            {
                projectId,
                type: copyToDuplicate.type,
                text: copyToDuplicate.text,
                buttonTitle: `${copyToDuplicate.buttonTitle} (Cópia)`,
                imageUrl: copyToDuplicate.imageUrl || undefined,
                subtitle: copyToDuplicate.subtitle || undefined,
            },
            {
                onSuccess: () => toast.success('Cópia duplicada com sucesso!'),
                onError: () => toast.error('Erro ao duplicar cópia.'),
            },
        )
    }

    const handleDelete = async (copyId: number) => {
        const confirmed = await confirmDelete('Tem certeza que deseja excluir esta copy?')
        if (confirmed && projectId) {
            deleteCopyMutation.mutate(
                {id: copyId, projectId},
                {
                    onSuccess: () => {
                        toast.success('Cópia excluída com sucesso!')
                    },
                    onError: () => {
                        toast.error('Erro ao excluir a cópia.')
                    },
                },
            )
        }
    }

    const handleMarkAllUnused = async () => {
        if (!projectId || !hasAnyCopy) return
        const result = await MySwal.fire({
            title: 'Reutilizar todas as Copys?',
            text: 'Isso marcará todas as copys do projeto como disponíveis para reutilização.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, marcar todas',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            focusCancel: true,
        })
        if (!result.isConfirmed) return
        try {
            setMarkingAll(true)
            await markAllMutation.mutateAsync({projectId})
            toast.success('Todas as copys foram marcadas como disponíveis.')
        } catch {
            toast.error('Não foi possível marcar as copys como disponíveis.')
        } finally {
            setMarkingAll(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }


    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Cópias de Broadcast</h1>
                    <p className="text-sm text-gray-400">
                        Gerencie as mensagens para o projeto: <span
                        className="font-semibold text-blue-300">{selectedProject?.name ?? '...'}</span>
                    </p>
                </div>

                <div className="w-full md:w-64">
                    <label className="text-white text-sm font-medium block mb-1">Selecione o projeto</label>
                    <select
                        className="w-full p-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                        value={projectId || ''}
                        onChange={(e) => setProjectId(Number(e.target.value))}
                        disabled={isLoadingProjects}
                    >
                        {projects?.map((proj) => (
                            <option key={proj.id} value={proj.id}>
                                {proj.name} ({proj.project_type === 'RCN' ? 'RCN' : 'Padrão'})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {configs && configs.length > 0 && (
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl space-y-6 shadow-lg">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-400"/>
                            Configurações Ativas
                        </h2>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-1 text-center">
                            <span className="text-gray-400 font-medium flex items-center gap-1">
                                <CopyPlusIcon className="w-4 h-4 text-blue-300"/>
                                Copys Disponíveis
                            </span>
                            <p className="font-bold text-2xl text-white">{unusedCount}</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {configs.map((config) => (
                            <div key={config.id}
                                 className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                                <h3 className="font-bold text-blue-300">{config.message_tag}</h3>
                                <div className="space-y-1">
                                    <span className="text-gray-400 font-medium flex items-center gap-1 text-sm">
                                        <Globe className="w-4 h-4"/>
                                        Timezone
                                    </span>
                                    <p className="text-sm font-semibold">{config.timezone}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-400 font-medium flex items-center gap-1 text-sm">
                                        <Clock className="w-4 h-4"/>
                                        Horários
                                    </span>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {typeof config.schedules === 'string' &&
                                            config.schedules
                                                .split(';')
                                                .filter(Boolean)
                                                .map((time, index) => (
                                                    <span key={index}
                                                          className="bg-blue-900 text-blue-100 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-600">
                                                        {time}
                                                    </span>
                                                ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-white">Mensagens Cadastradas</h2>
                <div className="flex items-center gap-3">
                    {/* Filtro de Status */}
                    <div className="relative flex-shrink-0">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                            className="pl-10 pr-8 py-2 appearance-none rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={usageFilter}
                            onChange={(e) => setUsageFilter(e.target.value as UsageStatusFilter)}
                        >
                            <option value="all">Todos os Status</option>
                            <option value="no">Disponíveis</option>
                            <option value="yes">Já Usadas</option>
                        </select>
                    </div>
                    <button
                        onClick={handleMarkAllUnused}
                        disabled={!projectId || markingAll || !hasAnyCopy || unusedCount === copys?.length}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold border border-gray-500"
                        title={unusedCount === copys?.length ? "Todas as copys já estão disponíveis" : "Marcar todas como disponíveis"}
                    >
                        <RotateCcw className="w-5 h-5"/>
                        {markingAll ? 'Marcando...' : 'Reutilizar todas'}
                    </button>
                    <button
                        onClick={() => {
                            setEditingCopy(null)
                            setIsModalOpen(true)
                        }}
                        disabled={!projectId}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
                    >
                        <PlusCircle className="w-5 h-5"/>
                        Nova Copy
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isLoadingCopys ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : filteredCopys && filteredCopys.length > 0 ? (
                    <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCopys.map((copy) => (
                            <CopyCard
                                key={copy.id}
                                copy={copy}
                                onEdit={() => {
                                    setEditingCopy(copy)
                                    setIsModalOpen(true)
                                }}
                                onDelete={() => handleDelete(copy.id)}
                                onDuplicate={() => handleDuplicate(copy)}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl mt-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-500"/>
                        <h3 className="mt-2 text-lg font-medium text-white">
                            {usageFilter !== 'all' ? 'Nenhuma copy encontrada com este status.' : 'Nenhuma copy cadastrada'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                            {usageFilter !== 'all' ? 'Tente alterar o filtro de status.' : 'Clique em Nova Copy para criar sua primeira mensagem.'}
                        </p>
                    </div>
                )}
            </AnimatePresence>

            {projectId && (
                <CopyModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    projectId={projectId}
                    copy={editingCopy}
                />
            )}
        </div>
    )
}