'use client'

import { useRouter } from 'next/navigation'
import { Folder, MoreVertical, Pencil, Trash2, Users, Copy, CheckCircle, XCircle, Bell } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Project } from '@/hooks/useProjects'

interface ProjectCardProps {
    project: Project;
    onEdit: () => void;
    onDelete: () => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const router = useRouter();
    const isRcn = project.project_type === 'RCN';

    return (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 flex flex-col group relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20">
            <div
                onClick={() => router.push(`/projects/${project.id}/options`)}
                className="p-5 pb-0 flex flex-col flex-grow cursor-pointer"
            >
                <div className="flex justify-between items-start">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0 shadow-lg">
                        {isRcn ? <Bell className="w-6 h-6 text-white" /> : <Folder className="w-6 h-6 text-white" />}
                    </div>

                    <div onClick={(e) => e.stopPropagation()} className="relative z-10">
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex justify-center rounded-full p-2 text-sm font-medium text-gray-400 hover:bg-gray-700">
                                <MoreVertical className="h-5 w-5" />
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
                                <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none border border-gray-700">
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={onEdit} className={`${active ? 'bg-blue-600 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={onDelete} className={`${active ? 'bg-red-600 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>

                <div className="mt-4 flex-grow">
                    <h2 className="text-lg font-bold text-white truncate transition-colors">{project.name}</h2>
                    <p className="text-sm text-gray-400 line-clamp-2 h-10 mb-4">{project.description || 'Sem descrição'}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-4 ${isRcn ? 'bg-purple-600 text-purple-100' : 'bg-blue-600 text-blue-100'}`}>
                        {isRcn ? 'RCN' : 'Broadcast Padrão'}
                     </span>
                </div>
            </div>

            <div className="border-t border-gray-700 bg-gray-900/30 px-5 py-4 space-y-3">
                <div>
                    {project.statusBroadcast === 'enabled' ? (
                        <span className="inline-flex items-center gap-1.5 text-green-300 bg-green-900/50 px-2.5 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" /> Broadcast Ativo
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-yellow-300 bg-yellow-900/50 px-2.5 py-1 rounded-full text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> Broadcast Pausado
                        </span>
                    )}
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500"/>
                        <span className="text-sm text-gray-300">Perfis:</span>
                        <span className="font-bold text-white">{project.totalProfiles}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Copy className="w-4 h-4 text-gray-500"/>
                        <span className="text-sm text-gray-300">Copys Disponíveis:</span>
                        <span className="font-bold text-white">{project.availableCopys}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}