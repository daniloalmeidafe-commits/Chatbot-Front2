'use client'

import { useParams, useRouter } from 'next/navigation'
import { useFacebookPagesByProfile, useSyncFacebookPages, useUpdateFacebookPageSettings, useDeleteFacebookPage } from '@/hooks/useFacebookPages'
import { useEffect, useMemo, useState, useRef } from 'react'
import { RefreshCw, Loader2, BarChartHorizontal, Trash2, ShieldCheck, ShieldOff, Download, FileText, MessageSquare } from 'lucide-react'
import SidebarFacebookPage from '@/components/SidebarFacebookPage'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { SyncPagesModal } from '@/components/SyncPagesModal'
import { ApplyTemplateModal } from '@/components/ApplyTemplateModal'
import { useQueryClient } from '@tanstack/react-query'
import { useSweetAlert } from '@/utils/useSweetAlert'
import { useProjectById } from '@/hooks/useProjects'

const STORAGE_KEY = 'facebook-pages-list-limit'

type SyncedPage = {
    id: number;
    name: string;
    pageId: string;
}

type FilterStatus = 'all' | 'enabled' | 'disabled';

export default function FacebookPagesList() {
    const router = useRouter()
    const { id, profileId } = useParams<{ id: string; profileId: string }>()
    const queryClient = useQueryClient()
    const { confirmDelete } = useSweetAlert()
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    const { data, isLoading: isLoadingPages } = useFacebookPagesByProfile(Number(profileId), 1, 999)
    const { data: projectData, isLoading: isLoadingProject } = useProjectById(Number(id))
    const allPages = useMemo(() => data?.data || [], [data]);

    const syncPagesMutation = useSyncFacebookPages();
    const updateSettingsMutation = useUpdateFacebookPageSettings();
    const deletePageMutation = useDeleteFacebookPage();

    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [isApplyTemplateModalOpen, setIsApplyTemplateModalOpen] = useState(false);
    const [syncedPages, setSyncedPages] = useState<SyncedPage[]>([]);
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<FilterStatus>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedPage, setSelectedPage] = useState<(typeof allPages)[number] | null>(null)
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false)

    const [limit, setLimit] = useState<number>(() => {
        if (typeof window === 'undefined') return 15
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return stored ? Number(stored) : 15
    })

    const filteredPages = useMemo(() => {
        let pages = allPages
        if (filter !== 'all') {
            pages = pages.filter((p) => p.status === filter)
        }
        if (search) {
            pages = pages.filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
            )
        }
        return pages
    }, [allPages, search, filter])

    const total = filteredPages.length
    const totalPages = Math.ceil(total / limit)
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * limit
        return filteredPages.slice(start, start + limit)
    }, [filteredPages, currentPage, limit])

    const isAllOnPageSelected = paginated.length > 0 && paginated.every(p => selectedIds.has(p.id));
    const isSomeOnPageSelected = paginated.some(p => selectedIds.has(p.id)) && !isAllOnPageSelected;

    const isLoading = isLoadingPages || isLoadingProject;

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.indeterminate = isSomeOnPageSelected;
        }
    }, [isSomeOnPageSelected]);

    useEffect(() => {
        setSelectedIds(new Set())
    }, [currentPage, filter, search, limit])

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(limit))
        } catch {}
    }, [limit])

    const handleSync = () => {
        syncPagesMutation.mutate(Number(profileId), {
            onSuccess: (newPages) => {
                if (newPages && newPages.length > 0) {
                    setSyncedPages(newPages);
                    setIsSyncModalOpen(true);
                } else {
                    toast.info('Nenhuma página nova foi encontrada para sincronizar.');
                }
            },
            onError: () => toast.error('Ocorreu um erro durante a sincronização.')
        });
    };

    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedIds(new Set(paginated.map(p => p.id)))
        } else {
            setSelectedIds(new Set())
        }
    }

    const handleSelectOne = (pageId: number, isChecked: boolean) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev)
            if (isChecked) {
                newSet.add(pageId)
            } else {
                newSet.delete(pageId)
            }
            return newSet
        })
    }

    const handleStatusToggle = (page: (typeof allPages)[number]) => {
        const newStatus = page.status === 'enabled' ? 'disabled' : 'enabled';
        updateSettingsMutation.mutate({ pageId: page.id, payload: { status: newStatus } });
    };

    const handleBulkAction = async (action: 'enable' | 'disable' | 'delete' | 'applyTemplate') => {
        if (action === 'applyTemplate') {
            if (!projectData) {
                toast.error("Aguarde os dados do projeto serem carregados.");
                return;
            }
            setIsApplyTemplateModalOpen(true);
            return;
        }

        const actionVerb = { enable: 'habilitar', disable: 'desabilitar', delete: 'excluir' };
        const confirm = await confirmDelete(`Deseja realmente ${actionVerb[action]} ${selectedIds.size} página(s) selecionada(s)?`);
        if (!confirm) return;

        setIsBulkActionLoading(true);

        const promises = Array.from(selectedIds).map(pageId => {
            if (action === 'delete') {
                return deletePageMutation.mutateAsync({ profileId: Number(profileId), pageId }, { onSuccess: () => {} });
            } else {
                const status = action === 'enable' ? 'enabled' : 'disabled';
                return updateSettingsMutation.mutateAsync({ pageId, payload: { status } }, { onSuccess: () => {} });
            }
        });

        const results = await Promise.allSettled(promises);

        const successfulCount = results.filter(r => r.status === 'fulfilled').length;
        if (successfulCount > 0) {
            toast.success(`${successfulCount} página(s) foram atualizadas com sucesso.`);
        }

        const failedCount = results.filter(r => r.status === 'rejected').length;
        if (failedCount > 0) {
            toast.error(`${failedCount} ações falharam.`);
        }

        await queryClient.invalidateQueries({ queryKey: ['facebook-pages-by-profile', Number(profileId)] });
        setSelectedIds(new Set());
        setIsBulkActionLoading(false);
    };

    return (
        <div className="p-6 space-y-6 text-white relative">
            <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white">← Voltar</button>

            <h1 className="text-2xl font-bold">
                Páginas - {projectData?.name ?? allPages[0]?.profile?.name ?? '...'}
            </h1>

            <div className="flex items-center flex-wrap gap-3">
                {selectedIds.size === 0 ? (
                    <>
                        <select
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2"
                            value={limit}
                            onChange={e => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                        >
                            {[15, 25, 50, 100].map(n => (<option key={n} value={n}>Mostrar {n}</option>))}
                        </select>
                        {['all', 'enabled', 'disabled'].map((f) => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f as FilterStatus); setCurrentPage(1); }}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === f ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                            >
                                {f === 'all' ? 'Todas' : f === 'enabled' ? 'Habilitadas' : 'Desabilitadas'}
                            </button>
                        ))}
                    </>
                ) : (
                    <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-700 px-4 py-1 rounded-lg">
                        <span className="text-sm font-semibold">{selectedIds.size} selecionada(s)</span>
                        <div className="h-6 w-px bg-gray-600"></div>
                        <button onClick={() => handleBulkAction('applyTemplate')} disabled={isBulkActionLoading} className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50">
                            <FileText size={16}/> Aplicar Template
                        </button>
                        <button onClick={() => handleBulkAction('enable')} disabled={isBulkActionLoading} className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 disabled:opacity-50">
                            <ShieldCheck size={16}/> Habilitar
                        </button>
                        <button onClick={() => handleBulkAction('disable')} disabled={isBulkActionLoading} className="flex items-center gap-1.5 text-sm text-yellow-400 hover:text-yellow-300 disabled:opacity-50">
                            <ShieldOff size={16}/> Desabilitar
                        </button>
                        <button onClick={() => handleBulkAction('delete')} disabled={isBulkActionLoading} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 disabled:opacity-50">
                            <Trash2 size={16}/> Excluir
                        </button>
                        {isBulkActionLoading && <Loader2 size={16} className="animate-spin" />}
                    </div>
                )}
                <div className="flex ml-auto gap-3">
                    <button onClick={handleSync} disabled={syncPagesMutation.isPending} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md focus:outline-none disabled:bg-gray-500">
                        {syncPagesMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        Escanear páginas
                    </button>
                    <button
                        onClick={() => router.push(`/projects/${id}/facebook-profiles/${profileId}/pages/import`)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        <Download size={18} className="opacity-80" />
                        Importar Leads
                    </button>
                    <input
                        type="text"
                        placeholder="Pesquisar páginas..."
                        className="bg-gray-800 px-4 py-2 border border-gray-700 rounded-lg text-sm"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20"><Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400"/></div>
            ) : (
                <div className="overflow-x-auto mt-4 rounded-lg border border-gray-700">
                    <table className="w-full">
                        <thead className="bg-gray-700 text-sm text-gray-300 uppercase">
                        <tr>
                            <th className="p-4 text-left">
                                <input ref={selectAllCheckboxRef} type="checkbox" checked={isAllOnPageSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="h-4 w-4 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-600"/>
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">Página</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-center font-semibold">Leads (Qualificados / Total)</th>
                            <th className="px-4 py-3 text-center font-semibold">Leads (24h)</th>
                            <th className="px-4 py-3 text-right font-semibold">Ações</th>
                        </tr>
                        </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
{paginated.map((page) => (
    <tr key={page.id} className={`transition-colors ${selectedIds.has(page.id) ? 'bg-blue-900/20' : 'hover:bg-gray-900/50'}`}>
        <td className="p-4">
            <input type="checkbox" checked={selectedIds.has(page.id)} onChange={(e) => handleSelectOne(page.id, e.target.checked)} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-blue-500 focus:ring-blue-600"/>
        </td>
        
        {/* FOTO E NOME DO LEAD (Agora com foto dinâmica do Graph API) */}
        <td onClick={() => setSelectedPage(page)} className="px-4 py-3 cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0">
                    <Image 
                        src={`https://graph.facebook.com/${page.pageId}/picture?type=square`} 
                        alt={page.name} 
                        fill
                        className="rounded-full object-cover border border-gray-600"
                    />
                </div>
                <div className="min-w-0">
                    <div className="text-white font-medium truncate w-32 sm:w-48">{page.name}</div>
                    <div className="text-gray-400 text-xs truncate w-32 sm:w-48">{page.pageEmail ?? 'Sem e-mail'}</div>
                </div>
            </div>
        </td>

        {/* MENSAGEM CENTRALIZADA (Destaque para o conteúdo) */}
        <td className="px-4 py-3 text-center min-w-[200px]">
            <div className="inline-block max-w-[300px] bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-200 italic border border-gray-600">
                {page.last_conversation_message ? (
                    `"${page.last_conversation_message}"`
                ) : (
                    <span className="text-gray-500">Nenhuma mensagem recente</span>
                )}
            </div>
        </td>

        <td className="px-4 py-3">
            {page.status === 'enabled' ? (
                <div className="flex items-center gap-2 text-green-400 justify-center"><span className="h-2 w-2 rounded-full bg-green-500"></span>Ativo</div>
            ) : (
                <div className="flex items-center gap-2 text-red-400 justify-center"><span className="h-2 w-2 rounded-full bg-red-500"></span>Inativo</div>
            )}
        </td>

        <td className="px-4 py-3 text-gray-200 text-center font-semibold">
            {page.currentLeadCount}
        </td>

        <td className="px-4 py-3 text-right">
            <button 
                onClick={() => setSelectedPage(page)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                title="Ver Detalhes"
            >
                <FileText size={18} className="text-blue-400" />
            </button>
        </td>
    </tr>
))}
</tbody>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!isLoading && paginated.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-xl">
                    <BarChartHorizontal className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">Nenhuma página encontrada</h3>
                    <p className="mt-1 text-sm text-gray-400">Tente ajustar os filtros ou pesquisar por outro termo.</p>
                </div>
            )}

            <div className="pt-6 flex justify-between items-center text-sm text-gray-400">
                <span>Mostrando <b>{(currentPage - 1) * limit + 1}</b> a <b>{Math.min(currentPage * limit, total)}</b> de <b>{total}</b> registros</span>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
                    <button className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próximo</button>
                </div>
            </div>

            {selectedPage && ( <SidebarFacebookPage page={selectedPage} onClose={() => setSelectedPage(null)} /> )}
            <SyncPagesModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} pages={syncedPages} profileId={Number(profileId)} />
            <ApplyTemplateModal
                isOpen={isApplyTemplateModalOpen}
                onClose={() => {setIsApplyTemplateModalOpen(false); setSelectedIds(new Set())}}
                pageIds={Array.from(selectedIds)}
                projectType={projectData?.project_type}
            />
        </div>
    )
}
