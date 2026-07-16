'use client'
import { useFacebookPagesByProfile, useImportLeads, FacebookPageDetails } from '@/hooks/useFacebookPages'
import { useParams } from 'next/navigation'
import { useMemo, useCallback, useState } from 'react'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

export default function ImportLeadsPage() {
    const { profileId } = useParams<{ projectId: string; profileId: string }>()
    const { data } = useFacebookPagesByProfile(Number(profileId), 1, 999)
    const allPages = useMemo(() => data?.data || [], [data])
    const importLeads = useImportLeads()

    const [importing, setImporting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorPages, setErrorPages] = useState<string[]>([])

    const handleScanClick = useCallback(async () => {
        if (!allPages.length) return
        setImporting(true)
        setProgress(0)
        setStatus('idle')
        setErrorPages([])

        const ids = allPages.map((page: FacebookPageDetails) => page.id)
        const chunks = chunkArray(ids, 50)
        let completed = 0
        const errors: string[] = []

        for (const [i, chunk] of chunks.entries()) {
            await Promise.all(
                chunk.map(async (id) => {
                    try {
                        await importLeads.mutateAsync(id)
                    } catch {
                        errors.push(id.toString())
                    }
                })
            )
            completed += chunk.length
            setProgress(Math.round((completed / ids.length) * 100))
            if (i < chunks.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 2000))
            }
        }

        setErrorPages(errors)
        setImporting(false)
        setStatus(errors.length === 0 ? 'success' : 'error')
    }, [allPages, importLeads])

    return (
        <div className="max-w-3xl mx-auto mt-12 px-4">
            <div className="bg-[#181F33] rounded-2xl shadow-lg p-8 flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>Importar Leads de Todas as Páginas</span>
                </h2>
                <p className="text-white">
                    Ao clicar em <b>Importar</b>, vamos buscar leads de todas as páginas conectadas ao perfil selecionado.
                </p>
                <p className="text-white mb-6">
                    Total de paginas: <strong className="font-bold"> {allPages.length} </strong>
                </p>
                <button
                    className={`w-full py-3 rounded-xl text-lg font-semibold transition-all
            ${importing ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white"}
          `}
                    onClick={handleScanClick}
                    disabled={importing || !allPages.length}
                >
                    {importing ? (
                        <span className="flex items-center gap-2 justify-center">
                          <Loader2 className="animate-spin" size={22} /> Importando...
                        </span>
                    ) : (
                        `Importar Leads`
                    )}
                </button>

                {(importing || progress > 0) && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300">Progresso:</span>
                            <span className="text-gray-200">{progress}%</span>
                        </div>
                        <div className="w-full h-4 bg-[#232A47] rounded-lg overflow-hidden">
                            <div
                                className="h-4 bg-gradient-to-r from-indigo-500 to-blue-400 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex items-center gap-2 mt-4 text-green-400">
                        <CheckCircle2 size={22} /> Importação concluída com sucesso!
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col gap-2 mt-4 text-red-400">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={22} /> Falha ao importar algumas páginas.
                        </div>
                        <div className="text-sm text-gray-400">
                            {errorPages.length} páginas apresentaram erro.
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}