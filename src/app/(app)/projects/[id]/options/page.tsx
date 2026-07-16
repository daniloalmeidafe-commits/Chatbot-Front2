'use client'

import {useParams, useSearchParams} from 'next/navigation'
import { Megaphone, Users, BotIcon} from 'lucide-react'

export default function ProjectOptionsPage() {
    const { id } = useParams<{ id: string }>()
    const searchParams = useSearchParams()
    const name = searchParams.get('name') || 'Projeto'

    return (
        <div className="p-6 text-white bg-[#0e1629] min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Opções do Projeto: {name}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <a
                    href={`/projects/${id}/facebook-profiles`}
                    className="group bg-[#141c35] border border-gray-700 rounded-2xl p-5 hover:bg-[#1a2442] transition-colors shadow-md flex items-center space-x-4"
                >
                    <Users className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                    <div>
                        <p className="text-white font-medium">Perfis do Facebook</p>
                        <p className="text-sm text-muted-foreground">Gerencie conexões e páginas</p>
                    </div>
                </a>

                <a
                    href={`/projects/${id}/broadcast`}
                    className="group bg-[#141c35] border border-gray-700 rounded-2xl p-5 hover:bg-[#1a2442] transition-colors shadow-md flex items-center space-x-4"
                >
                    <Megaphone className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                    <div>
                        <p className="text-white font-medium">Broadcasts</p>
                        <p className="text-sm text-muted-foreground">Gerencie, crie e edite campanhas</p>
                    </div>
                </a>

                <a
                    href={`/projects/${id}/automations`}
                    className="group bg-[#141c35] border border-gray-700 rounded-2xl p-5 hover:bg-[#1a2442] transition-colors shadow-md flex items-center space-x-4"
                >
                    <BotIcon className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                    <div>
                        <p className="text-white font-medium">Automações</p>
                        <p className="text-sm text-muted-foreground">Gerencie Automações do projeto</p>
                    </div>
                </a>
            </div>
        </div>
    )
}
