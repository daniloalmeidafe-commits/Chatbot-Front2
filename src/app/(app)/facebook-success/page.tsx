'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateFacebookProfile } from '@/hooks/useFacebookProfiles'
import { useFacebookPages, useSaveFacebookPages } from '@/hooks/useFacebookPages'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

const statusSteps = [
    'Conectando com o Facebook...',
    'Adicionando perfil...',
    'Buscando páginas vinculadas...',
    'Salvando páginas...',
    'Tudo pronto! Redirecionando...',
]

export default function FacebookSuccessPage() {
    const router = useRouter()
    const createProfile = useCreateFacebookProfile()
    const savePages = useSaveFacebookPages()

    const hasExecuted = useRef(false)
    const hasSavedPages = useRef(false)

    const [statusIndex, setStatusIndex] = useState(0)
    const [profileIdCreated, setProfileIdCreated] = useState<number | null>(null)

    const { data: pages } = useFacebookPages(profileIdCreated ?? 0)

    useEffect(() => {
        const updateStatus = (index: number, delay = 1000) => {
            setTimeout(() => setStatusIndex(index), delay)
        }

        if (
            !hasSavedPages.current &&
            profileIdCreated &&
            Array.isArray(pages) &&
            pages.length > 0
        ) {
            hasSavedPages.current = true
            updateStatus(3)

            savePages.mutate(
                { profileId: profileIdCreated, pages },
                {
                    onSuccess: () => {
                        updateStatus(4)
                        setTimeout(() => {
                            window.location.href = `/projects/${localStorage.getItem('selectedProjectId')}/facebook-profiles`
                        }, 1500)
                    },
                    onError: () => {
                        toast.error('Erro ao salvar as páginas.')
                        window.location.href = `/projects/${localStorage.getItem('selectedProjectId')}/facebook-profiles`
                    },
                }
            )
        }
    }, [pages, profileIdCreated, savePages])

    useEffect(() => {
        if (hasExecuted.current) return
        hasExecuted.current = true

        const searchParams = new URLSearchParams(window.location.search)
        const accessToken = searchParams.get('accessToken')
        const fbProfileId = searchParams.get('profileId')
        const name = searchParams.get('name')
        const email = searchParams.get('email') ? searchParams.get('email') : `${name + Math.random().toString(36).substring(7)}@example.com`
        const projectId = localStorage.getItem('selectedProjectId')

        if (!accessToken || !fbProfileId || !name || !email || !projectId) {
            toast.error('Erro ao recuperar os dados do Facebook.')
            return router.replace('/projects')
        }

        const run = async () => {
            try {
                setStatusIndex(1)
                const response = await createProfile.mutateAsync({
                    accessToken,
                    profileId: fbProfileId,
                    name,
                    email,
                    description: '',
                    projectId: Number(projectId),
                })

                const id = response?.id
                if (id) {
                    setStatusIndex(2)
                    toast.success('Perfil criado com sucesso!')
                    setProfileIdCreated(id)
                } else {
                    throw new Error('ID do perfil não retornado')
                }
            } catch {
                toast.error('Erro ao salvar o perfil do Facebook.')
                router.replace(`/projects/${projectId}/facebook-profiles`)
            }
        }

        run()
    }, [createProfile, router])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <AnimatePresence mode="wait">
                <motion.h1
                    key={statusIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl font-semibold"
                >
                    {statusSteps[statusIndex]}
                </motion.h1>
            </AnimatePresence>
        </div>
    )
}