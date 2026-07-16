'use client'

import React, { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBroadcastAudit } from '@/hooks/useProjectBroadcast'
import {
    ArrowLeft, CheckCircle2, AlertTriangle, PieChart, Loader2, FileText, Landmark, ChevronDown, Search
} from 'lucide-react'

interface AccordionItemProps {
    title: string;
    count: number;
    children: React.ReactNode;
    errorCode: number | string;
}

const AccordionItem = ({ title, count, children, errorCode }: AccordionItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const googleSearchUrl = `https://www.google.com/search?q=facebook%20graph%20api%20error%20${errorCode}`;

    return (
        <div className="border-b border-gray-700 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-4 hover:bg-gray-800/50 transition-colors"
            >
                <div className="flex-1">
                    <span className="font-semibold text-white">{title}</span>
                    <span className="ml-2 text-xs bg-red-800 text-red-200 font-bold px-2 py-0.5 rounded-full">{count} {count > 1 ? 'ocorrências' : 'ocorrência'}</span>
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="p-4 bg-black bg-opacity-20">
                    <div className="mb-4">
                        <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-blue-400 hover:underline">
                            <Search className="w-3 h-3"/>
                            Pesquisar sobre o erro {errorCode}
                        </a>
                    </div>
                    <h5 className="font-semibold text-gray-300 mb-2">Detalhes Técnicos (fbtrace_id):</h5>
                    <pre className="text-xs text-gray-400 bg-black p-3 rounded-md overflow-x-auto">
                        {children}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default function BroadcastAuditPage() {
    const router = useRouter()
    const params = useParams<{ id: string; broadcastId: string }>()
    const broadcastId = Number(params.broadcastId)

    const { data: auditData, isLoading } = useBroadcastAudit(broadcastId)

    const summary = useMemo(() => {
        if (!auditData) {
            return { totalSent: 0, totalFailed: 0, successRate: 0 }
        }
        const totalSent = auditData.reduce((acc, item) => acc + Number(item.enviados), 0)
        const totalFailed = auditData.reduce((acc, item) => acc + Number(item.falhos), 0)
        const totalMessages = totalSent + totalFailed
        const successRate = totalMessages > 0 ? (totalSent / totalMessages) * 100 : 0
        return { totalSent, totalFailed, successRate }
    }, [auditData])

    const processErrorLogs = (logs: string) => {
        if (!logs) return {};

        const lines = logs.trim().split('\n');

        return lines.reduce((acc, line) => {
            try {
                const parsed = JSON.parse(line);
                const error = parsed.error;
                if (error) {
                    const key = `${error.code || 'N/A'}: ${error.message}`;
                    if (!acc[key]) {
                        acc[key] = {
                            message: error.message,
                            code: error.code,
                            count: 0,
                            traces: [],
                        };
                    }
                    acc[key].count++;
                    acc[key].traces.push(error.fbtrace_id);
                }
            } catch {
                const key = 'Erro de formato desconhecido';
                if (!acc[key]) {
                    acc[key] = { message: 'Log com formato inválido', code: 'N/A', count: 0, traces: [] };
                }
                acc[key].count++;
                acc[key].traces.push(line);
            }
            return acc;
        }, {} as Record<string, { message: string; code: number | string; count: number; traces: string[] }>);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <div className="flex items-center gap-3 text-xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    Carregando análise do broadcast...
                </div>
            </div>
        )
    }

    if (!auditData || auditData.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
                <AlertTriangle className="w-16 h-16 text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Nenhum dado encontrado</h2>
                <p className="text-gray-400 mb-6">Não foi possível carregar os dados de auditoria para este broadcast.</p>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 bg-gray-900 min-h-screen text-white">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para a lista de broadcasts
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold">
                        Análise do Broadcast <span className="text-blue-400">#{broadcastId}</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
                        <div className="p-3 bg-blue-900/50 rounded-full">
                            <PieChart className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Taxa de Sucesso Geral</p>
                            <p className="text-3xl font-bold">{summary.successRate.toFixed(1)}%</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
                        <div className="p-3 bg-green-900/50 rounded-full">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total de Envios</p>
                            <p className="text-3xl font-bold">{summary.totalSent}</p>
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
                        <div className="p-3 bg-red-900/50 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total de Falhas</p>
                            <p className="text-3xl font-bold">{summary.totalFailed}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold border-b border-gray-700 pb-2">
                        Desempenho por Página
                    </h2>
                    {auditData.map((pageAudit) => {
                        const sent = Number(pageAudit.enviados);
                        const failed = Number(pageAudit.falhos);
                        const total = sent + failed;
                        const successPercentage = total > 0 ? (sent / total) * 100 : 0;
                        const failPercentage = total > 0 ? (failed / total) * 100 : 0;

                        const groupedErrors = processErrorLogs(pageAudit.log_erros);
                        const hasErrors = Object.keys(groupedErrors).length > 0;

                        return (
                            <div key={pageAudit.page_id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-5">
                                <h3 className="text-xl font-semibold text-blue-300 flex items-center gap-2">
                                    <Landmark className="w-5 h-5" />
                                    {pageAudit.page_name}
                                </h3>

                                <div className="space-y-3">
                                    <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden flex text-white text-xs font-bold shadow-inner">
                                        {successPercentage > 0 && (
                                            <div
                                                className="bg-green-500 h-full flex items-center justify-center transition-all duration-700 ease-out"
                                                style={{ width: `${successPercentage}%` }}
                                            >
                                                {successPercentage > 15 && `${successPercentage.toFixed(1)}%`}
                                            </div>
                                        )}
                                        {failPercentage > 0 && (
                                            <div
                                                className="bg-red-500 h-full flex items-center justify-center transition-all duration-700 ease-out"
                                                style={{ width: `${failPercentage}%` }}
                                            >
                                                {failPercentage > 15 && `${failPercentage.toFixed(1)}%`}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle2 className="w-4 h-4"/>
                                            <span><b>{sent}</b> Enviados com Sucesso</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-red-400">
                                            <AlertTriangle className="w-4 h-4"/>
                                            <span><b>{failed}</b> Falhas</span>
                                        </div>
                                    </div>
                                </div>

                                {hasErrors && (
                                    <div className="bg-gray-900/70 p-4 rounded-lg mt-4">
                                        <h4 className="text-md font-semibold mb-2 flex items-center gap-2 text-gray-300">
                                            <FileText className="w-4 h-4" />
                                            Relatório Detalhado de Erros
                                        </h4>
                                        <div className="border border-gray-700 rounded-lg overflow-hidden">
                                            {Object.values(groupedErrors).map((error, index) => (
                                                <AccordionItem
                                                    key={index}
                                                    title={error.message}
                                                    count={error.count}
                                                    errorCode={error.code}
                                                >
                                                    {error.traces.join('\n')}
                                                </AccordionItem>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}