'use client'

import { useParams } from 'next/navigation'
import { useFacebookProfiles } from '@/hooks/useFacebookProfiles'
import { FacebookIcon, Loader2 } from 'lucide-react'
import { loginWithFacebook } from '@/utils/facebook'
import { ProfileCard } from '@/components/ProfileCard'

export default function FacebookProfilesPage() {
    const { id } = useParams<{ id: string }>()
    const projectId = Number(id)


    const { data, isLoading } = useFacebookProfiles(projectId)

    const profiles = data?.profiles || [];

    const projectName = data?.projectName ?? '...';

    const profilesWithProjectId = profiles.map(profile => ({
        ...profile,
        projectId: projectId
    }));

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">
                    Perfis Conectados - {projectName}
                </h1>
                <button
                    onClick={() => loginWithFacebook(projectId)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer font-semibold"
                >
                    <FacebookIcon className="w-5 h-5" />
                    Conectar Novo Perfil
                </button>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            )}

            {!isLoading && profilesWithProjectId.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {profilesWithProjectId.map((profile) => (
                        <ProfileCard key={profile.id} profile={profile} />
                    ))}
                </div>
            )}

            {!isLoading && profiles.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl mt-8">
                    <FacebookIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">Nenhum perfil conectado</h3>
                    <p className="mt-1 text-sm text-gray-400">Clique em Conectar Novo Perfil para começar a gerenciar suas páginas.</p>
                </div>
            )}
        </div>
    )
}