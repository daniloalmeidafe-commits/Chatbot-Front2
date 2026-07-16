'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCreateAutomation } from '@/hooks/useAutomations'
import { ArrowLeft, Loader2, Workflow } from 'lucide-react'
import { toast } from 'react-toastify'

type CreateAutomationResponse = {
    data?: {
        id?: number;
    };
};

export default function NewAutomationPage() {
    const router = useRouter()
    const { id: projectId } = useParams<{ id: string }>()
    const createAutomationMutation = useCreateAutomation()

    const [automationName, setAutomationName] = useState('')

    const handleCreateSubmit = () => {
        if (!automationName.trim()) {
            toast.info('Por favor, dê um nome para a sua automação.');
            return;
        }

        createAutomationMutation.mutate(
            {
                projectId: Number(projectId),
                name: automationName,
            },
            {
                onSuccess: (data: unknown) => {
                    const response = data as CreateAutomationResponse;
                    const newAutomationId = response?.data?.id;
                    if (newAutomationId) {
                        toast.success('Automação criada! Redirecionando para o editor de fluxo...');
                        router.push(`/projects/${projectId}/automations/${newAutomationId}/flowbuilder`);
                    } else {
                        router.push(`/projects/${projectId}/automations`);
                    }
                },
            }
        );
    };

    return (
        <div className="p-6 md:p-8 bg-gray-900 min-h-screen text-white flex flex-col items-center">
            <div className="w-full max-w-lg">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-white mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para automações
                </button>

                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-900/70">
                            <Workflow className="w-6 h-6 text-blue-400"/>
                        </div>
                        <h1 className="text-2xl font-bold">
                            Criar Nova Automação
                        </h1>
                    </div>

                    <div className="flex-grow">
                        <label htmlFor="automationName" className="block mb-2 text-sm font-medium text-gray-300">
                            Nome da Automação
                        </label>
                        <input
                            id="automationName"
                            type="text"
                            value={automationName}
                            onChange={(e) => setAutomationName(e.target.value)}
                            placeholder="Ex: Fluxo de Boas-Vindas"
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleCreateSubmit}
                            disabled={createAutomationMutation.isPending}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:bg-blue-800/50"
                        >
                            {createAutomationMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Criar e ir para o Editor de Fluxo'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
