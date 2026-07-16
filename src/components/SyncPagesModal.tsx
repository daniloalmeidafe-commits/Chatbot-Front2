import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { useDeleteFacebookPage } from '@/hooks/useFacebookPages'
import { toast } from 'react-toastify'
import { Loader2, Trash2, ListPlus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'

type SyncedPage = {
    id: number;
    name: string;
    pageId: string;
}

interface SyncPagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    pages: SyncedPage[];
    profileId: number;
}

export function SyncPagesModal({ isOpen, onClose, pages, profileId }: SyncPagesModalProps) {
    const [idsToDelete, setIdsToDelete] = useState<Set<number>>(new Set());
    const queryClient = useQueryClient();
    const deletePageMutation = useDeleteFacebookPage();

    useEffect(() => {
        if (!isOpen) {
            setIdsToDelete(new Set());
        }
    }, [isOpen, pages]);

    const handleCheckboxChange = (pageId: number) => {
        setIdsToDelete(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pageId)) {
                newSet.delete(pageId);
            } else {
                newSet.add(pageId);
            }
            return newSet;
        });
    };

    const allSelected = pages.length > 0 && idsToDelete.size === pages.length;

    const handleSelectAll = () => {
        if (allSelected) {
            setIdsToDelete(new Set());
        } else {
            setIdsToDelete(new Set(pages.map(p => p.id)));
        }
    };

    const handleDeleteSelected = async () => {
        if (idsToDelete.size === 0) {
            toast.info('Nenhuma página selecionada para exclusão.');
            return;
        }

        const pagesToDeleteArray = Array.from(idsToDelete);

        try {
            const deletePromises = pagesToDeleteArray.map(pageId =>
                deletePageMutation.mutateAsync(
                    { profileId, pageId },
                    { onSuccess: () => {} }
                )
            );

            await Promise.allSettled(deletePromises);

            await queryClient.invalidateQueries({ queryKey: ['facebook-pages-by-profile', profileId] });

            toast.success(`${pagesToDeleteArray.length} página(s) removida(s) com sucesso!`);
            onClose();
        } catch (error) {
            toast.error('Ocorreu um erro ao remover as páginas.');
            console.log(error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="bg-gray-800 p-6 rounded-2xl text-white space-y-5 w-full max-w-2xl border border-gray-700 shadow-2xl">
                    <Dialog.Title className="text-xl font-bold flex items-center gap-3">
                        <ListPlus className="w-6 h-6 text-blue-400"/>
                        Páginas Novas Sincronizadas
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-400">
                        As páginas a seguir foram encontradas em sua conta do Facebook e adicionadas ao sistema. Selecione quais você deseja <b>remover</b> imediatamente.
                    </Dialog.Description>

                    <div className="border-t border-b border-gray-700">
                        <div className="flex items-center gap-3 bg-gray-900/50 p-3 border-b border-gray-700">
                            <input
                                id="select-all-checkbox"
                                type="checkbox"
                                checked={allSelected}
                                onChange={handleSelectAll}
                                className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600 cursor-pointer"
                            />
                            <label htmlFor="select-all-checkbox" className="font-semibold text-white cursor-pointer select-none">
                                {allSelected ? 'Desmarcar Todas' : 'Marcar Todas'}
                            </label>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1 p-1">
                            {pages.map(page => (
                                <div key={page.id} className="flex items-center gap-3 hover:bg-gray-900/50 p-2 rounded-md">
                                    <input
                                        id={`page-checkbox-${page.id}`}
                                        type="checkbox"
                                        checked={idsToDelete.has(page.id)}
                                        onChange={() => handleCheckboxChange(page.id)}
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-600 cursor-pointer flex-shrink-0"
                                    />
                                    <Image
                                        src={`https://graph.facebook.com/${page.pageId}/picture?type=normal`}
                                        alt={page.name}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                    <label htmlFor={`page-checkbox-${page.id}`} className="font-medium text-white cursor-pointer select-none flex-grow truncate">{page.name}</label>
                                    <span className="text-xs text-gray-500">ID: {page.pageId}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                         <span className="text-sm text-gray-400">
                            {idsToDelete.size} de {pages.length} selecionada(s)
                        </span>
                        <div className="flex gap-4">
                            <button onClick={onClose} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all text-white px-4 py-1 rounded-sm text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                Concluir
                            </button>
                            <button
                                onClick={handleDeleteSelected}
                                disabled={idsToDelete.size === 0 || deletePageMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:bg-red-800/50 disabled:cursor-not-allowed transition-colors"
                            >
                                {deletePageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin"/> : <Trash2 className="w-5 h-5" />}
                                Excluir Selecionadas
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}