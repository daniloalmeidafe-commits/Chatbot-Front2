// src/app/(app)/projects/[id]/broadcast/settings/page.tsx

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
    MessageTag,
    useBroadcastConfigsList,
    useCreateBroadcastConfigWithTag,
    useUpdateBroadcastConfigWithTag,
    useDeleteBroadcastConfigWithTag,
} from '@/hooks/useBroadcastConfig'
import { ArrowLeft } from 'lucide-react'
import Select from 'react-select'
import Creatable from 'react-select/creatable'
import makeAnimated from 'react-select/animated'
import { toast } from 'react-toastify'
import { ProjectSidebarNav } from '@/components/ProjectSidebarNav'
import { useProjects } from '@/hooks/useProjects'
import { Switch } from '@headlessui/react'

const animatedComponents = makeAnimated()

const hoursOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, '0') + ':00'
    return { value: hour, label: hour }
})

const urlToOption = (url: string) => ({ value: url, label: url })

const TABS = [
    { id: MessageTag.NON_PROMO, label: 'Não Promocional' },
    { id: MessageTag.PROMO_24H, label: 'Promocional 24h' },
]

const allowedTimezones = [
    "UTC", "America/Sao_Paulo", "America/Buenos_Aires", "America/Mexico_City",
    "America/New_York", "America/Chicago", "America/Los_Angeles", "America/Toronto",
    "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Madrid", "Europe/Rome",
    "Europe/Lisbon", "Europe/Zurich", "Asia/Tokyo", "Asia/Shanghai", "Asia/Singapore",
    "Asia/Hong_Kong", "Asia/Dubai", "Australia/Sydney", "Pacific/Auckland",
    "Africa/Johannesburg", "Africa/Cairo"
]

export default function BroadcastConfigPage() {
    const { id: paramId } = useParams<{ id: string }>()
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<MessageTag>(MessageTag.NON_PROMO)
    const [isEnabled, setIsEnabled] = useState(false)

    const { data: configs, isLoading } = useBroadcastConfigsList(Number(paramId))
    const create = useCreateBroadcastConfigWithTag()
    const update = useUpdateBroadcastConfigWithTag()
    const deleteConfig = useDeleteBroadcastConfigWithTag()

    const [timezone, setTimezone] = useState('America/Sao_Paulo')
    const [hours, setHours] = useState<{ value: string; label: string }[]>([])
    const [urls, setUrls] = useState<{ value: string; label: string }[]>([])

    const { data: projects } = useProjects()
    const project = projects?.find((p) => p.id === Number(paramId))

    const currentConfig = useMemo(() => {
        return configs?.find((c) => c.message_tag === activeTab)
    }, [configs, activeTab])

    const conflictingHoursSet = useMemo(() => {
        if (!configs) return new Set();
        const otherTabTag = activeTab === MessageTag.NON_PROMO ? MessageTag.PROMO_24H : MessageTag.NON_PROMO;
        const otherConfig = configs.find((c) => c.message_tag === otherTabTag);
        if (otherConfig && otherConfig.schedules) {
            return new Set(otherConfig.schedules.split(/[;,]/).filter(Boolean));
        }
        return new Set();
    }, [configs, activeTab]);

    useEffect(() => {
        if (currentConfig) {
            setIsEnabled(true)
            setTimezone(currentConfig.timezone || 'America/Sao_Paulo')
            const scheduleSource = currentConfig.schedules || ''
            setHours(scheduleSource.split(/[;,]/).filter(Boolean).map((h: string) => ({ value: h, label: h })))
            setUrls(
                typeof currentConfig.urls === 'string'
                    ? currentConfig.urls.split(';').map(urlToOption)
                    : []
            )
        } else {
            setIsEnabled(false)
            setTimezone('America/Sao_Paulo')
            setHours([])
            setUrls([])
        }
    }, [currentConfig, activeTab])

    const handleToggle = (checked: boolean) => {
        setIsEnabled(checked)
        if (!checked && currentConfig && project) {
            deleteConfig.mutate({ id: currentConfig.id, projectId: project.id });
        }
    }

    function handleSubmit() {
        if (!project) return;

        if (hours.length === 0) {
            toast.error('Você precisa selecionar pelo menos um horário.');
            return;
        }
        const otherTab = TABS.find(t => t.id !== activeTab);
        for (const hour of hours) {
            if (conflictingHoursSet.has(hour.value)) {
                toast.error(`O horário ${hour.value} já está em uso no broadcast "${otherTab?.label}".`);
                return;
            }
        }

        const payload = {
            timezone,
            schedules: hours.map((h) => h.value).join(';'),
            urls: urls.map((u) => u.value).join(';'),
            message_tag: activeTab,
        };

        if (currentConfig) {
            update.mutate(
                { id: currentConfig.id, payload: { ...payload, projectId: project.id } },
                {
                    onSuccess: () => toast.success('Configuração atualizada com sucesso!'),
                    onError: () => toast.error('Erro ao atualizar a configuração.'),
                }
            );
        } else {
            create.mutate(
                { projectId: project.id, ...payload },
                {
                    onSuccess: () => toast.success('Configuração criada com sucesso!'),
                    onError: () => toast.error('Erro ao criar a configuração.'),
                }
            );
        }
    }

    return (
        <div className="p-6 space-y-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <h1 className="text-3xl font-bold text-white">
                Configuração de Broadcast – {project?.name || ''}
            </h1>
            <div className="flex flex-col md:flex-row gap-6">
                <ProjectSidebarNav />
                <div className="flex-1 bg-gray-800 p-6 rounded-xl space-y-6">
                    <div className="flex border-b border-gray-700">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-white'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg">
                        <div>
                            <p className="font-semibold text-white">Broadcast {TABS.find(t => t.id === activeTab)?.label}</p>
                            <p className={`text-sm ${isEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                                {isEnabled ? 'Ativo' : 'Desativado'}
                            </p>
                        </div>
                        <Switch
                            checked={isEnabled}
                            onChange={handleToggle}
                            className={`${isEnabled ? 'bg-blue-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                        >
                            <span className={`${isEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                        </Switch>
                    </div>

                    {isEnabled && (
                        <div className="space-y-6 border-t border-gray-700 pt-6">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Timezone</label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                                >
                                    {allowedTimezones.map((tz: string) => (<option key={tz} value={tz}>{tz}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Horários</label>
                                <Select
                                    isMulti
                                    components={animatedComponents}
                                    value={hours}
                                    onChange={(value) => setHours(value as { value: string; label: string }[])}
                                    options={hoursOptions}
                                    styles={{
                                        control: (base) => ({ ...base, backgroundColor: '#1f2937', color: '#fff' }),
                                        menu: (base) => ({ ...base, backgroundColor: '#1f2937' }),
                                        multiValue: (base) => ({ ...base, backgroundColor: '#364153' }),
                                        multiValueLabel: (base) => ({ ...base, color: '#fff' }),
                                        multiValueRemove: (base) => ({ ...base, color: '#fff', ':hover': { backgroundColor: '#374151', color: '#fff' } }),
                                        option: (base, state) => {
                                            const isConflicting = conflictingHoursSet.has(state.data.value);
                                            if (isConflicting) {
                                                return { ...base, backgroundColor: '#1f2937', color: '#7f1d1d', textDecoration: 'line-through', cursor: 'not-allowed' };
                                            }
                                            return { ...base, backgroundColor: state.isFocused ? '#374151' : '#1f2937', color: '#fff' };
                                        },
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">URLs</label>
                                <Creatable
                                    isMulti
                                    components={animatedComponents}
                                    value={urls}
                                    onChange={(value) => setUrls(value ? (value as { value: string; label: string }[]) : [])}
                                    styles={{
                                        control: (base) => ({ ...base, backgroundColor: '#1f2937', color: '#fff' }),
                                        menu: (base) => ({ ...base, backgroundColor: '#1f2937' }),
                                        multiValue: (base) => ({ ...base, backgroundColor: '#364153' }),
                                        multiValueLabel: (base) => ({ ...base, color: '#fff' }),
                                        multiValueRemove: (base) => ({ ...base, color: '#fff', ':hover': { backgroundColor: '#374151', color: '#fff' } }),
                                        option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#374151' : '#1f2937', color: '#fff' }),
                                    }}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={create.isPending || update.isPending || isLoading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-gray-500"
                                >
                                    {isLoading ? 'Carregando...' : 'Salvar Configuração'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}