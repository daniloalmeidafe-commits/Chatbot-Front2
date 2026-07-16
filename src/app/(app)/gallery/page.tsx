'use client'

import { useState, useCallback, useMemo } from 'react'
import {
    useListImages,
    useUploadImage,
    useDeleteImage,
    useListCategories,
    useDeleteCategory,
} from '@/hooks/useImages'
import { useDropzone } from 'react-dropzone'
import {
    Loader2,
    UploadCloud,
    Image as ImageIcon,
    Copy,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react'
import { useSweetAlert } from '@/utils/useSweetAlert'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { CreateCategoryModal } from '@/components/CreateCategoryModal'

export default function ImageGalleryPage() {
    const { data: images, isLoading: isLoadingImages } = useListImages()
    const { data: categories, isLoading: isLoadingCategories } = useListCategories()
    const uploadMutation = useUploadImage()
    const deleteMutation = useDeleteImage()
    const deleteCategoryMutation = useDeleteCategory()
    const { confirmDelete } = useSweetAlert()

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all')

    const isLoading = isLoadingImages || isLoadingCategories

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0]
            if (!file) return

            if (selectedCategoryId === 'all' || typeof selectedCategoryId !== 'number') {
                toast.error('Por favor, selecione uma categoria para enviar a imagem.')
                return
            }

            uploadMutation.mutate({ file, categoryId: selectedCategoryId })
        },
        [uploadMutation, selectedCategoryId],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
        multiple: false,
        disabled: selectedCategoryId === 'all' || isLoadingCategories,
    })

    const handleDelete = async (filename: string) => {
        const confirmed = await confirmDelete(
            'Deseja realmente excluir esta imagem? A ação será permanente.',
        )
        if (confirmed) {
            if (filename) {
                deleteMutation.mutate(filename)
            } else {
                toast.error('Nome do ficheiro inválido.')
            }
        }
    }

    const handleDeleteCategory = async () => {
        if (selectedCategoryId === 'all') {
            toast.error('Nenhuma categoria selecionada para excluir.')
            return
        }

        const categoryName = categories?.find(
            (c) => c.id === selectedCategoryId,
        )?.name

        const confirmed = await confirmDelete(
            `Deseja realmente excluir a categoria "${categoryName}"? Todas as imagens dentro dela serão perdidas permanentemente.`,
        )

        if (confirmed) {
            deleteCategoryMutation.mutate(selectedCategoryId, {
                onSuccess: () => {
                    setSelectedCategoryId('all')
                },
            })
        }
    }

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url)
        toast.success('URL da imagem copiada!')
    }

    const filteredImages = useMemo(() => {
        if (!images) return []
        if (selectedCategoryId === 'all') {
            return images
        }
        return images.filter(
            (image) => image.category.id === selectedCategoryId,
        )
    }, [images, selectedCategoryId])

    const totalPages = Math.ceil(filteredImages.length / itemsPerPage)
    const paginatedImages = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredImages.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredImages, currentPage, itemsPerPage])

    const hasCategories = categories && categories.length > 0
    const hasImages = images && images.length > 0

    return (
        <div className="p-6 space-y-8 text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Galeria de Imagens</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nova Categoria
                </button>
            </div>

            <div
                {...getRootProps()}
                className={`p-10 border-2 border-dashed rounded-2xl text-center transition-colors duration-300 ${
                    !hasCategories
                        ? 'border-gray-800 bg-gray-900/50 cursor-not-allowed opacity-60'
                        : selectedCategoryId === 'all'
                            ? 'border-yellow-600/50 bg-yellow-900/20 cursor-not-allowed opacity-80'
                            : isDragActive
                                ? 'border-blue-500 bg-blue-900/20 cursor-copy'
                                : 'border-gray-700 hover:border-gray-600 cursor-pointer'
                }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                    <UploadCloud className="w-12 h-12" />
                    {!hasCategories ? (
                        <p className="font-semibold text-gray-400">
                            Crie uma categoria antes de enviar
                        </p>
                    ) : selectedCategoryId === 'all' ? (
                        <p className="font-semibold text-yellow-400">
                            Selecione uma categoria antes de enviar
                        </p>
                    ) : (
                        <p className="font-semibold">
                            Arraste e solte uma imagem aqui, ou clique para
                            selecionar
                        </p>
                    )}
                    <p className="text-xs">PNG, JPG, GIF, WEBP</p>
                    {uploadMutation.isPending && (
                        <Loader2 className="w-6 h-6 animate-spin text-blue-400 mt-2" />
                    )}
                </div>
            </div>

            {/* SEÇÃO DO FILTRO (CORRIGIDA) */}
            {!isLoading && hasCategories && (
                <div className="flex items-center gap-4">
                    <label
                        htmlFor="categoryFilter"
                        className="text-sm font-medium text-gray-300 flex-shrink-0"
                    >
                        Filtrar por Categoria:
                    </label>
                    <select
                        id="categoryFilter"
                        value={selectedCategoryId}
                        onChange={(e) =>
                            setSelectedCategoryId(
                                e.target.value === 'all'
                                    ? 'all'
                                    : Number(e.target.value),
                            )
                        }
                        className="w-full max-w-xs bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                    >
                        <option value="all">Todas as Imagens</option>
                        {categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {selectedCategoryId !== 'all' && (
                        <button
                            onClick={handleDeleteCategory}
                            disabled={deleteCategoryMutation.isPending}
                            className="p-2 bg-gray-800 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50"
                        >
                            {deleteCategoryMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* SEÇÃO DA GALERIA (LÓGICA CORRIGIDA) */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : !hasCategories ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl mt-8">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">
                        Nenhuma categoria encontrada
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                        Comece por criar a sua primeira categoria usando o botão
                        &ldquo;Nova Categoria&rdquo;.
                    </p>
                </div>
            ) : !hasImages ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl mt-8">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">
                        Nenhuma imagem encontrada
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                        Selecione uma categoria acima e envie sua primeira
                        imagem.
                    </p>
                </div>
            ) : filteredImages.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <AnimatePresence>
                            {paginatedImages.map((image) => (
                                <motion.div
                                    key={image.filename}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative aspect-square group overflow-hidden rounded-lg border border-gray-700"
                                >
                                    <Image
                                        src={image.url}
                                        alt="Imagem da galeria"
                                        layout="fill"
                                        objectFit="cover"
                                        className="transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                        <button
                                            onClick={() =>
                                                handleCopyUrl(image.url)
                                            }
                                            className="p-3 bg-gray-900/50 rounded-full hover:bg-blue-600"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    image.filename,
                                                )
                                            }
                                            className="p-3 bg-gray-900/50 rounded-full hover:bg-red-600"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="pt-6 flex justify-between items-center text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <span>Mostrar</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(
                                        Number(e.target.value),
                                    )
                                    setCurrentPage(1)
                                }}
                                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1"
                            >
                                {[12, 24, 48, 96].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <span>itens</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>
                                Página {currentPage} de {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-50"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((p) => p - 1)
                                    }
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-50"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((p) => p + 1)
                                    }
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl mt-8">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">
                        Nenhuma imagem encontrada nesta categoria
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                        Tente selecionar outra categoria ou envie uma nova
                        imagem.
                    </p>
                </div>
            )}

            <CreateCategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}