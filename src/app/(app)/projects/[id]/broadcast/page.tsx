'use client'

import {useParams, useRouter} from 'next/navigation'
import {useMemo, useState} from 'react'
import {BroadcastStatus, useProjectBroadcasts,} from '@/hooks/useProjectBroadcast'
import {useProjects} from '@/hooks/useProjects'
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Globe, Link2,
    Loader2,
    RefreshCw,
    Settings,
    Users,
    Workflow,
    Tag,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import {useBroadcastConfigsList} from "@/hooks/useBroadcastConfig";
import { formatInTimeZone } from 'date-fns-tz'
import Image from 'next/image'

const DonutChart = ({ percentage, size = 40 }: { percentage: number, size?: number }) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
                className="text-gray-700"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <circle
                className="text-blue-500"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                className="text-xs font-bold fill-current text-white rotate-90 origin-center"
            >
                {`${Math.round(percentage)}%`}
            </text>
        </svg>
    );
};

type Broadcast = {
    id: number;
    message: string;
    schedule_time: string;
    end_schedule_time?: string;
    createdAt: string;
    status: BroadcastStatus;
    amountLead: number;
    amountLeadSend: number;
    message_tag: string;
    timezone: string;
}

export default function ProjectBroadcastsPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const projectId = Number(id)
    const { data: configs } = useBroadcastConfigsList(projectId ?? 0)

    const { data: projects } = useProjects()
    const project = useMemo(
        () => projects?.find((p) => p.id === projectId),
        [projects, projectId]
    )

    const [status, setStatus] = useState<BroadcastStatus | undefined>(undefined)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const { data, isLoading, refetch } = useProjectBroadcasts({
        projectId,
        page,
        limit,
        status,
        startDate,
        endDate,
    })

    const broadcastData: Broadcast[] = data?.data || []
    const totalBroadcasts = data?.total || 0
    const totalPages = Math.ceil(totalBroadcasts / limit)

    return (
        <div className="p-6 space-y-6 text-white">
            <h1 className="text-3xl font-bold">
                Broadcasts do Projeto:{' '}
                <span className="text-blue-400">{project?.name || '...'}</span>
            </h1>

            <div className="bg-gray-800 p-4 rounded-xl flex flex-wrap gap-4 items-center text-sm">
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value ? (e.target.value as BroadcastStatus) : undefined)
                        setPage(1)
                    }}
                    className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded"
                >
                    <option value="">Todos os status</option>
                    <option value="sent">Enviados</option>
                    <option value="processing">Processando</option>
                    <option value="failed">Falhos</option>
                </select>

                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded"
                />

                <button
                    onClick={() => refetch()}
                    className="ml-auto flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                </button>
            </div>

            {configs && configs.length > 0 && (
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl space-y-4 shadow-lg">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-400" />
                        Configurações de Broadcast Ativas
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {configs.map((config) => (
                            <div key={config.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                                <h3 className="font-bold text-blue-300">{config.message_tag}</h3>
                                <div className="space-y-1">
                                    <span className="text-gray-400 font-medium flex items-center gap-1 text-sm">
                                        <Globe className="w-4 h-4" /> Timezone
                                    </span>
                                    <p className="text-sm font-semibold">{config.timezone}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-400 font-medium flex items-center gap-1 text-sm">
                                        <Clock className="w-4 h-4" /> Horários
                                    </span>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {typeof config.schedules === 'string' && config.schedules.split(';').filter(Boolean).map((time, index) => (
                                            <span key={index} className="bg-blue-900 text-blue-100 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-600">
                                                {time}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-400 font-medium flex items-center gap-1 text-sm">
                                        <Link2 className="w-4 h-4" /> URLs
                                    </span>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {typeof config.urls === 'string' && config.urls.split(';').filter(Boolean).map((url, index) => (
                                            <span key={index} className="bg-gray-700 text-white text-xs font-medium px-2.5 py-1 rounded-full border border-gray-500">
                                                {url}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-10 text-gray-400 flex justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Carregando...
                </div>
            ) : broadcastData.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-400 mt-6">Nenhum broadcast encontrado para os filtros selecionados.</p>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {broadcastData.map((b: Broadcast) => {
                            let isImage = false;
                            let messageTitle = 'Mensagem inválida';
                            let messageSubtitle = '';
                            let imageUrl = '';
                            let buttonTitle = '';

                            try {
                                const parsed = JSON.parse(b.message);
                                const payload = parsed?.message?.attachment?.payload;
                                if (payload?.template_type === 'generic') {
                                    isImage = true;
                                    const element = payload.elements?.[0];
                                    messageTitle = element?.title || 'Título indisponível';
                                    messageSubtitle = element?.subtitle || '';
                                    imageUrl = element?.image_url || '';
                                    buttonTitle = element?.buttons?.[0]?.title || '';
                                } else if (payload?.template_type === 'button') {
                                    messageTitle = payload.text || 'Texto indisponível';
                                    buttonTitle = payload.buttons?.[0]?.title || '';
                                }
                            } catch {}

                            const deliveryRate = b.amountLead > 0 ? (b.amountLeadSend / b.amountLead) * 100 : 0;
                            const formattedSchedule = formatInTimeZone(new Date(b.schedule_time), b.timezone, 'dd/MM/yyyy HH:mm');

                            function timeProcessing(dateA: string | Date | undefined, dateB: string | Date | undefined) {
                                if (!dateA || !dateB) return 'N/A';
                                const diffMs = new Date(dateA).getTime() - new Date(dateB).getTime()
                                const diffSec = Math.abs(Math.floor(diffMs / 1000))
                                if (diffSec < 60) return `${diffSec} segundos`;
                                const minutes = Math.floor(diffSec / 60)
                                const seconds = diffSec % 60
                                return `${minutes}m ${seconds}s`
                            }

                            return (
                                <div
                                    key={b.id}
                                    onClick={() => router.push(`/projects/${projectId}/broadcast/${b.id}/audit`)}
                                    className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col space-y-4 hover:shadow-lg hover:border-blue-500 transition-all duration-200 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {b.status === 'sent' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-green-300 bg-green-900/50 px-2 py-1 rounded-full text-xs font-medium">
                                                      <CheckCircle2 className="w-3.5 h-3.5" /> Enviado
                                                    </span>
                                                ) : b.status === 'processing' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-yellow-300 bg-yellow-900/50 px-2 py-1 rounded-full text-xs font-medium">
                                                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processando
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-red-300 bg-red-900/50 px-2 py-1 rounded-full text-xs font-medium">
                                                      <AlertCircle className="w-3.5 h-3.5" /> Falhou
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1.5 text-indigo-300 bg-indigo-900/50 px-2 py-1 rounded-full text-xs font-medium">
                                                    <Tag className="w-3.5 h-3.5"/> {b.message_tag}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-center flex-shrink-0">
                                            <DonutChart percentage={deliveryRate} />
                                            <p className="text-xs text-gray-400 mt-1">Entrega</p>
                                        </div>
                                    </div>

                                    <div className="flex-grow bg-gray-900/50 p-4 rounded-md min-h-[120px] flex flex-col">
                                        {isImage && imageUrl && (
                                            <div className="relative w-full aspect-square mb-3 rounded-md overflow-hidden">
                                                <Image src={imageUrl} alt={messageTitle} layout="fill" objectFit="cover" />
                                            </div>
                                        )}
                                        <p className="font-semibold text-white whitespace-pre-wrap">{messageTitle}</p>
                                        {isImage && messageSubtitle && <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{messageSubtitle}</p>}
                                        {buttonTitle && (
                                            <div className="mt-auto pt-4">
                                                <div className="inline-block bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow">
                                                    {buttonTitle}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-700 pt-4 space-y-2 text-xs text-gray-300">
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-2 text-gray-400"><Clock className="w-4 h-4" /> Início Agendado:</span>
                                            <span className="font-semibold">{formattedSchedule}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-2 text-gray-400"><Globe className="w-4 h-4" /> Fuso Horário:</span>
                                            <span className="font-semibold">{b.timezone}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-2 text-gray-400"><Workflow className="w-4 h-4" /> Duração do Envio:</span>
                                            <span className="font-semibold">{timeProcessing(b.end_schedule_time, b.schedule_time)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-2 text-gray-400"><Users className="w-4 h-4" /> Leads (Enviados/Total):</span>
                                            <span className="font-semibold">{b.amountLeadSend} / {b.amountLead}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page <= 1}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Anterior
                        </button>
                        <span className="text-sm font-medium">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= totalPages}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
