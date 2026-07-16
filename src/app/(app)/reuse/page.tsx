'use client'

import { useState, useMemo } from 'react'
import {
    useProjectStockReport,
    useResetBroadcastCopies,
    ProjectStockReport
} from '@/hooks/useBroadcastCopys'
import {
    AlertTriangle,
    Loader2,
    RefreshCw,
    FolderKanban,
    Search,
    HelpCircle
} from 'lucide-react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

function InfoTooltip({ text }: { text: string }) {
    return (
        <div className="relative group">
            <HelpCircle size={14} className="text-gray-400 cursor-pointer ml-1" />
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 text-xs text-white bg-gray-700 rounded-lg shadow-lg z-10">
                {text}
            </div>
        </div>
    )
}

function StockReportRow({ report }: { report: ProjectStockReport }) {
    const [daysToReset, setDaysToReset] = useState(30)

    const canReset = report.dias_conteudo_usado > 0;

    const { mutate, isPending } = useResetBroadcastCopies()

    const handleReset = async () => {
        if (daysToReset <= 0) {
            MySwal.fire({
                icon: 'warning',
                title: 'Dias Inválidos',
                text: 'O número de dias para reset deve ser maior que zero.',
            })
            return
        }

        if (!canReset) {
            MySwal.fire({
                icon: 'info',
                title: 'Reset Indisponível',
                text: 'Não há cópias usadas elegíveis para reutilização neste projeto.',
            })
            return
        }

        if (daysToReset > report.dias_conteudo_usado) {
            MySwal.fire({
                icon: 'error',
                title: 'Volume Excedido',
                html: `Você solicitou **${daysToReset} dias**, mas o Potencial Máximo Reutilizável é de **${report.dias_conteudo_usado} dias**.<br><br>Por favor, ajuste o valor para um número menor ou igual ao potencial.`,
            })
            return
        }

        MySwal.fire({
            title: `Confirmar Reset para ${report.nome_projeto}?`,
            html: `Esta ação tentará reutilizar cópias não usadas há mais de 20 dias, com base em um volume de **${daysToReset} dias** de disparo.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, Resetar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                mutate({ projectId: report.project_id, daysToReset }, {
                    onSuccess: (data) => {
                        MySwal.fire({
                            icon: 'success',
                            title: 'Reset Concluído!',
                            text: data.message,
                        })
                    },
                    onError: (error) => {
                        const errorMessage = error.message || 'Ocorreu um erro ao resetar as cópias.';
                        MySwal.fire({
                            icon: 'error',
                            title: 'Erro ao Resetar',
                            text: errorMessage,
                        })
                    }
                })
            }
        })
    }

    const getAvailabilityColor = (days: number) => {
        if (days < 7) return 'text-red-500 font-bold'
        return 'text-green-500 font-bold'
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center space-x-4 mb-3">
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{report.nome_projeto}</h3>
                <p className="text-gray-400 text-sm">ID: {report.project_id} | Disparos Diários: {report.total_disparos_dia}</p>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-4 min-w-[300px]">
                <div className="text-center flex flex-col items-center">
                    <div className="flex items-center justify-center">
                        <p className="text-gray-400 text-xs uppercase">Conteúdo Disponível</p>
                        <InfoTooltip text="Número de cópias não utilizadas que estão prontas para serem disparadas. Indica a sustentabilidade imediata." />
                    </div>
                    <p className={getAvailabilityColor(report.dias_conteudo_novo)}>
                        {report.copys_nao_usadas} ({report.dias_conteudo_novo} dias)
                    </p>
                </div>

                <div className="text-center flex flex-col items-center">
                    <div className="flex items-center justify-center">
                        <p className="text-gray-400 text-xs uppercase">Conteúdo Total</p>
                        <InfoTooltip text="Total de todas as cópias existentes (usadas + não usadas). Mostra a capacidade máxima do projeto." />
                    </div>
                    <p className="text-white font-medium">
                        {report.total_copys_geral} ({report.dias_conteudo_total} dias)
                    </p>
                </div>

                <div className="text-center flex flex-col items-center">
                    <div className="flex items-center justify-center">
                        <p className="text-gray-400 text-xs uppercase">Cóp. para Reutilizar</p>
                        <InfoTooltip text="O número de dias que podem ser recuperados ao executar o Reset. Cópias marcadas como 'usadas' que são elegíveis para reaproveitamento." />
                    </div>
                    <p className="text-white font-medium">
                        {report.dias_conteudo_usado} dias
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
                    <input
                        type="number"
                        min="1"
                        value={daysToReset}
                        onChange={(e) => setDaysToReset(Number(e.target.value))}
                        className="w-16 bg-transparent text-white text-center border-none focus:ring-0 focus:outline-none"
                    />
                    <span className="text-gray-400 text-sm">dias</span>
                </div>
                <button
                    onClick={handleReset}
                    disabled={isPending || report.project_id === 0 || !canReset}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                        isPending
                            ? 'bg-blue-800 cursor-not-allowed'
                            : canReset
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-600 cursor-not-allowed'
                    }`}
                >
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    <span>{isPending ? 'Processando...' : 'Resetar'}</span>
                </button>
            </div>
        </div>
    )
}


export default function ReusePage() {
    const { data: reports, isLoading, isError, error } = useProjectStockReport()

    const [searchTerm, setSearchTerm] = useState('')

    const filteredReports = useMemo(() => {
        if (!reports) return [];
        if (!searchTerm) return reports;

        const lowerCaseSearch = searchTerm.toLowerCase();

        return reports.filter(report =>
            report.nome_projeto.toLowerCase().includes(lowerCaseSearch)
        );
    }, [reports, searchTerm]);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="ml-3 text-white">Carregando Relatório de Estoque...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-400">
                <AlertTriangle size={32} />
                <h2 className="mt-2 text-xl">Erro ao carregar o relatório</h2>
                <p className="text-sm text-gray-400">{error.message}</p>
            </div>
        )
    }

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Reutilização de Copys</h1>
            <p className="text-gray-400 mb-6">
                Monitore o estoque de cópias por projeto e acione o reset otimizado para reutilizar conteúdos antigos.
                A função Resetar permite reaproveitar cópias que estão marcadas como usadas há mais de 20 dias, respeitando o volume de dias configurado abaixo.
            </p>

            <div className="mb-6 flex items-center gap-4 w-full max-w-lg">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome do projeto..."
                        className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredReports.length > 0 ? (
                <div className="space-y-4">
                    {filteredReports.map((report) => (
                        <StockReportRow key={report.project_id} report={report} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl mt-8">
                    <FolderKanban className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">
                        Nenhum projeto encontrado com o filtro aplicado.
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                        Tente ajustar sua busca por nome.
                    </p>
                </div>
            )}
        </div>
    )
}