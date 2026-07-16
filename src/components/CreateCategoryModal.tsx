'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { useCreateCategory } from '@/hooks/useImages'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

interface CreateCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateCategoryModal({ isOpen, onClose }: CreateCategoryModalProps) {
    const [name, setName] = useState('')
    const createCategoryMutation = useCreateCategory()

    useEffect(() => {
        if (!isOpen) {
            setName('')
        }
    }, [isOpen])

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error('O nome da categoria não pode estar vazio.')
            return
        }

        createCategoryMutation.mutate(
            { name: name.trim() },
            {
                onSuccess: () => {
                    onClose()
                },
            },
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
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-bold leading-6 text-white"
                                >
                                    Criar Nova Categoria
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-400">
                                        Digite o nome para a nova categoria da
                                        galeria.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <label
                                        htmlFor="categoryName"
                                        className="block text-sm font-medium text-gray-300"
                                    >
                                        Nome da Categoria
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            id="categoryName"
                                            placeholder="Ex: Imagens de Marketing"
                                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={
                                            !name.trim() ||
                                            createCategoryMutation.isPending
                                        }
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white disabled:bg-blue-800/50"
                                    >
                                        {createCategoryMutation.isPending && (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        )}
                                        Salvar Categoria
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