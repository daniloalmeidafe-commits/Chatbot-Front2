'use client'

import { Dialog, Transition, RadioGroup } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import {
    useCreateBroadcastCopy,
    useUpdateBroadcastCopy,
    Copy,
    CreateBroadcastCopyDto,
    UpdateBroadcastCopyDto,
} from '@/hooks/useBroadcastCopys'
import { Loader2, Image as ImageIcon, MessageSquare, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import { GalleryPickerModal } from '@/components/GalleryPickerModal'

interface CopyModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
    copy: Copy | null;
}

const initialState = {
    text: '',
    buttonTitle: '',
    imageUrl: '',
    subtitle: '',
    isUsed: 'no' as 'yes' | 'no',
}

export function CopyModal({ isOpen, onClose, projectId, copy }: CopyModalProps) {
    const [type, setType] = useState<'button' | 'image'>('button')
    const [form, setForm] = useState(initialState)
    const [isPickerOpen, setIsPickerOpen] = useState(false)

    const createMutation = useCreateBroadcastCopy()
    const updateMutation = useUpdateBroadcastCopy()

    const isLoading = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (copy) {
            setType(copy.type || 'button')
            setForm({
                text: copy.text || '',
                buttonTitle: copy.buttonTitle || '',
                imageUrl: copy.imageUrl || '',
                subtitle: copy.subtitle || '',
                isUsed: copy.isUsed || 'no',
            })
        } else {
            setType('button')
            setForm(initialState)
        }
    }, [copy, isOpen])

    const handleSubmit = () => {
        const basePayload = {
            projectId,
            type,
            text: form.text,
            buttonTitle: form.buttonTitle,
            imageUrl: type === 'image' ? form.imageUrl : undefined,
            subtitle: type === 'image' ? form.subtitle : undefined,
        }

        if (copy) {
            const updatePayload: UpdateBroadcastCopyDto = {
                ...basePayload,
                isUsed: form.isUsed,
            }
            updateMutation.mutate(
                { id: copy.id, data: updatePayload },
                {
                    onSuccess: () => {
                        toast.success('Cópia atualizada com sucesso!')
                        onClose()
                    },
                    onError: () => toast.error('Erro ao atualizar a cópia.'),
                },
            )
        } else {
            const createPayload: CreateBroadcastCopyDto = basePayload
            createMutation.mutate(createPayload, {
                onSuccess: () => {
                    toast.success('Cópia criada com sucesso!')
                    onClose()
                },
                onError: () => toast.error('Erro ao criar a cópia.'),
            })
        }
    }

    return (
        <>
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
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-gray-800 p-6 text-white shadow-xl transition-all border border-gray-700">
                                <Dialog.Title as="h3" className="text-xl font-bold">
                                    {copy ? 'Editar Cópia' : 'Nova Cópia'}
                                </Dialog.Title>

                                <div className="mt-4">
                                    <RadioGroup
                                        value={type}
                                        onChange={setType}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <RadioGroup.Option
                                            value="button"
                                            as={Fragment}
                                        >
                                            {({ checked }) => (
                                                <div
                                                    className={`cursor-pointer rounded-lg p-4 text-center border-2 ${
                                                        checked
                                                            ? 'bg-blue-900/50 border-blue-500'
                                                            : 'border-gray-600 hover:border-gray-500'
                                                    }`}
                                                >
                                                    <MessageSquare className="mx-auto mb-2 h-6 w-6" />{' '}
                                                    Mensagem de Texto
                                                </div>
                                            )}
                                        </RadioGroup.Option>
                                        <RadioGroup.Option
                                            value="image"
                                            as={Fragment}
                                        >
                                            {({ checked }) => (
                                                <div
                                                    className={`cursor-pointer rounded-lg p-4 text-center border-2 ${
                                                        checked
                                                            ? 'bg-blue-900/50 border-blue-500'
                                                            : 'border-gray-600 hover:border-gray-500'
                                                    }`}
                                                >
                                                    <ImageIcon className="mx-auto mb-2 h-6 w-6" />{' '}
                                                    Mensagem com Imagem
                                                </div>
                                            )}
                                        </RadioGroup.Option>
                                    </RadioGroup>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {type === 'image'
                                                ? 'Título (texto principal)'
                                                : 'Texto da Mensagem'}
                                        </label>
                                        <textarea
                                            value={form.text}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    text: e.target.value,
                                                })
                                            }
                                            rows={type === 'image' ? 2 : 5}
                                            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                                        />
                                    </div>

                                    {type === 'image' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    URL da Imagem
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={form.imageUrl}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                imageUrl:
                                                                e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                                                        placeholder="Cole a URL ou selecione da galeria"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            setIsPickerOpen(true)
                                                        }
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold"
                                                    >
                                                        <Search className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                                    Subtítulo (texto abaixo da
                                                    imagem)
                                                </label>
                                                <textarea
                                                    value={form.subtitle}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            subtitle:
                                                            e.target
                                                                .value,
                                                        })
                                                    }
                                                    rows={3}
                                                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Título do Botão
                                        </label>
                                        <input
                                            value={form.buttonTitle}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    buttonTitle:
                                                    e.target.value,
                                                })
                                            }
                                            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-blue-800/50"
                                    >
                                        {isLoading && (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        )}
                                        Salvar Cópia
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <GalleryPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelectImage={(image) => {
                    setForm((prev) => ({ ...prev, imageUrl: image.url }))
                }}
            />
        </>
    )
}