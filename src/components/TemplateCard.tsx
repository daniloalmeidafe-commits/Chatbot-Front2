'use client'

import { PageTemplateSetting, TemplateTypeEnum } from '@/hooks/usePageTemplateSettings'
import { FileText, MoreVertical, Pencil, Trash2, Copy, Bell } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface TemplateCardProps {
    template: PageTemplateSetting;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

export function TemplateCard({ template, onClick, onEdit, onDelete, onDuplicate }: TemplateCardProps) {
    const isRcn = template.templateType === TemplateTypeEnum.RCN;

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col group relative hover:border-blue-500 transition-colors duration-200">
            <div className="absolute top-2 right-2 z-10">
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
                                        <button onClick={onDuplicate} className={`${active ? 'bg-blue-600 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                            <Copy className="mr-2 h-4 w-4" /> Duplicar
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

            <div onClick={onClick} className="p-5 flex-grow cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                    {isRcn ? (
                        <Bell className="w-5 h-5 text-purple-400"/>
                    ) : (
                        <FileText className="w-5 h-5 text-blue-400"/>
                    )}
                    <h2 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">{template.name}</h2>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 h-10 mb-3">{template.description}</p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${isRcn ? 'bg-purple-600 text-purple-100' : 'bg-blue-600 text-blue-100'}`}>
                    {isRcn ? 'RCN' : 'Broadcast Padrão'}
                </span>
            </div>

            <div className="mt-auto px-5 pb-4 text-xs text-gray-500">
                ID do Template: {template.id}
            </div>
        </div>
    )
}