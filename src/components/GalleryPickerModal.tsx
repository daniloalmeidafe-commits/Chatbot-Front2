'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState, useMemo } from 'react'
import { useListCategories, useListImages, ImageEntity } from '@/hooks/useImages'
import { Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface GalleryPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (image: ImageEntity) => void;
}

export function GalleryPickerModal({
    isOpen,
    onClose,
    onSelectImage,
}: GalleryPickerModalProps) {
    const { data: images, isLoading: isLoadingImages } = useListImages()
    const { data: categories, isLoading: isLoadingCategories } = useListCategories()
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all')

    const isLoading = isLoadingImages || isLoadingCategories

    const filteredImages = useMemo(() => {
        if (!images) return []
        if (selectedCategoryId === 'all') {
            return images
        }
        return images.filter(
            (image) => image.category.id === selectedCategoryId,
        )
    }, [images, selectedCategoryId])

    const handleSelect = (image: ImageEntity) => {
        onSelectImage(image)
        onClose()
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
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
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-bold leading-6 text-white"
                                >
                                    Selecionar Imagem da Galeria
                                </Dialog.Title>

                                <div className="mt-4">
                                    <label
                                        htmlFor="categoryFilterModal"
                                        className="text-sm font-medium text-gray-300"
                                    >
                                        Filtrar por Categoria:
                                    </label>
                                    <select
                                        id="categoryFilterModal"
                                        value={selectedCategoryId}
                                        onChange={(e) =>
                                            setSelectedCategoryId(
                                                e.target.value === 'all'
                                                    ? 'all'
                                                    : Number(e.target.value),
                                            )
                                        }
                                        className="mt-1 w-full max-w-xs bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                                    >
                                        <option value="all">
                                            Todas as Imagens
                                        </option>
                                        {categories?.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-4 h-96 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                                    {isLoading ? (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                        </div>
                                    ) : filteredImages.length === 0 ? (
                                        <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                                            <ImageIcon className="h-12 w-12" />
                                            <h3 className="mt-2 text-md font-medium text-white">
                                                Nenhuma imagem encontrada
                                            </h3>
                                            <p className="mt-1 text-sm">
                                                Tente selecionar outra categoria.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                            {filteredImages.map((image) => (
                                                <button
                                                    key={image.id}
                                                    onClick={() =>
                                                        handleSelect(image)
                                                    }
                                                    className="relative aspect-square w-full transform rounded-lg border-2 border-gray-700 overflow-hidden transition-all duration-200 hover:border-blue-500 hover:scale-105"
                                                >
                                                    <Image
                                                        src={image.url}
                                                        alt="Imagem da galeria"
                                                        layout="fill"
                                                        objectFit="cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold text-white"
                                    >
                                        Cancelar
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