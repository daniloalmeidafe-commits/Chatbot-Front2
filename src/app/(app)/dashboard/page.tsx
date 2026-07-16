'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { useAuthStore } from '@/store/authStore'
import {
    Loader2,
    FolderKanban,
    Globe,
    UserPlus,
    UserCheck,
    UserMinus,
    Folder,
    Users,
    ArrowRight,
    Search,
    Plus
} from 'lucide-react'
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    colorClass: string;
}

const StatCard = ({ title, value, icon: Icon, colorClass }: StatCardProps) => (
    <div className="bg-gray-800/50 border border-gray-700/80 rounded-2xl p-5 shadow-lg flex items-center gap-5">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${colorClass} shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700 shadow-xl">
                <p className="font-bold text-white mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        <span className="text-gray-400">{entry.name}:</span>
                        <span className="font-semibold text-white">{entry.value?.toLocaleString('pt-BR')}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user)
    const { data, isLoading, error } = useDashboard(user?.id)
    const router = useRouter()
    const [projectSearch, setProjectSearch] = useState('');

    const filteredProjects = useMemo(() => {
        return data?.totalLeadsPerProject.filter(p =>
            p.projectName.toLowerCase().includes(projectSearch.toLowerCase())
        ) ?? [];
    }, [data?.totalLeadsPerProject, projectSearch]);

    const topProjectsChartData = useMemo(() => {
        if (!data?.totalLeadsPerProject) return [];
        return [...data.totalLeadsPerProject]
            .sort((a, b) => b.validCount - a.validCount)
            .slice(0, 10)
            .map(proj => ({
                name: proj.projectName,
                "Total": proj.leadCount,
                "Válidos": proj.validCount,
                "Desinscritos": proj.unsubscribeLeadCount,
            }));
    }, [data?.totalLeadsPerProject]);

    const projectsToDisplay = useMemo(() => {
        if (projectSearch) {
            return filteredProjects;
        }
        return filteredProjects.slice(0, 6);
    }, [filteredProjects, projectSearch]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <p className="text-red-500">Erro ao carregar o dashboard.</p>
            </div>
        )
    }

    function formatMilhar(num: number) {
        return num.toLocaleString('pt-BR')
    }

    return (
        <div className="p-6 space-y-8 text-white bg-gray-900 min-h-screen">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.name}!</h1>
                <p className="text-gray-400">Aqui está um resumo da sua atividade.</p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        <StatCard title="Total de Leads" value={formatMilhar(data?.totalLeadsCount ?? 0)} icon={Users} colorClass="bg-yellow-500/20" />
                        <StatCard title="Leads Válidos" value={formatMilhar(data?.totalValid ?? 0)} icon={UserCheck} colorClass="bg-green-500/20" />
                        <StatCard title="Leads (30 dias)" value={formatMilhar(data?.leadsLast30Days ?? 0)} icon={UserPlus} colorClass="bg-blue-500/20" />
                        <StatCard title="Projetos Ativos" value={data?.projectsCount ?? 0} icon={FolderKanban} colorClass="bg-indigo-500/20" />
                        <StatCard title="Páginas Ativas" value={data?.activePagesCount ?? 0} icon={Globe} colorClass="bg-teal-500/20" />
                        <StatCard title="Desinscritos" value={formatMilhar(data?.totalUnsubscribe ?? 0)} icon={UserMinus} colorClass="bg-red-500/20" />
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700/80 rounded-2xl p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Top 10 Projetos por Leads Válidos</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={topProjectsChartData}
                                    margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
                                >
                                    <CartesianGrid stroke="#374151" strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        width={150}
                                        tick={{ fontSize: 12, fill: '#d1d5db' }}
                                        interval={0}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '25px' }} />
                                    <Bar dataKey="Total" fill="#60a5fa" radius={[0, 8, 8, 0]} />
                                    <Bar dataKey="Válidos" fill="#4ade80" radius={[0, 8, 8, 0]} />
                                    <Bar dataKey="Desinscritos" fill="#f87171" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 bg-gray-800/50 border border-gray-700/80 rounded-2xl p-6 shadow-lg flex flex-col">
                    <h2 className="text-xl font-semibold mb-4">Seus Projetos</h2>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Pesquisar projeto..."
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-4 overflow-y-auto flex-grow pr-2 -mr-2">
                        {projectsToDisplay.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-400 text-sm">Nenhum projeto encontrado.</p>
                                <button
                                    onClick={() => router.push('/projects')}
                                    className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Criar Primeiro Projeto
                                </button>
                            </div>
                        ) : (
                            projectsToDisplay.map((project) => (
                                <div
                                    key={project.projectId}
                                    className="flex items-center cursor-pointer justify-between bg-gray-800 p-4 rounded-xl shadow-md hover:bg-gray-700/50 transition-colors group"
                                    onClick={() => router.push(`/projects/${project.projectId}/options`)}
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-900/70 flex-shrink-0">
                                            <Folder className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-semibold text-white truncate">{project.projectName}</p>
                                            <p className="text-sm text-blue-400">{project.validCount} leads válidos</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
                                </div>
                            ))
                        )}
                    </div>
                    {data && !projectSearch && data.totalLeadsPerProject.length > 6 && (
                        <div className="mt-auto pt-4 border-t border-gray-700/50">
                            <button
                                onClick={() => router.push('/projects')}
                                className="w-full text-center py-3 px-4 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 font-semibold transition-colors"
                            >
                                Ver Todos os Projetos
                            </button>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    )
}
