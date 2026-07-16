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
import { useProjectById } from '@/hooks/useProjects' // Importar o hook

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
    const { data: projectData, isLoading: isLoadingProject } = useProjectById(Number(id)) // Buscar dados do projeto
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
        const start = (currentPage - 1)  limit
        return filteredPages.slice(start, start +
