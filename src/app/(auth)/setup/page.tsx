'use client'

import axios from 'axios'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, ImagePlus, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { BrandMark } from '@/components/BrandMark'
import { useSetup, useSetupStatus } from '@/hooks/useSetup'
import { DEFAULT_BRAND_NAME } from '@/lib/branding'
import { useAuthStore } from '@/store/authStore'

const setupSchema = z.object({
    brandName: z.string().trim().min(1, 'Informe o nome do sistema'),
    name: z.string().trim().min(1, 'Informe o nome'),
    email: z.string().email(),
    password: z.string().min(6),
})

type SetupFormData = z.infer<typeof setupSchema>

export default function SetupPage() {
    const router = useRouter()
    const setupMutation = useSetup()
    const token = useAuthStore((state) => state.token)
    const isHydrated = useAuthStore((state) => state.isHydrated)
    const setupStatusQuery = useSetupStatus({
        enabled: isHydrated && !token,
    })
    const [showPassword, setShowPassword] = useState(false)
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null)
    const [logoError, setLogoError] = useState<string | null>(null)

    const logoPreviewUrl = useMemo(
        () => (selectedLogo ? URL.createObjectURL(selectedLogo) : undefined),
        [selectedLogo],
    )

    useEffect(() => {
        return () => {
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl)
            }
        }
    }, [logoPreviewUrl])

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SetupFormData>({
        resolver: zodResolver(setupSchema),
    })
    const watchedBrandName = watch('brandName')

    useEffect(() => {
        if (!isHydrated) {
            return
        }

        if (token) {
            router.replace('/dashboard')
            return
        }

        if (setupStatusQuery.data && !setupStatusQuery.data.setupRequired) {
            router.replace('/login')
        }
    }, [isHydrated, router, setupStatusQuery.data, token])

    const onSubmit = (data: SetupFormData) => {
        setupMutation.mutate({ ...data, logo: selectedLogo }, {
            onSuccess: () => {
                router.replace('/dashboard')
            },
            onError: (error) => {
                if (axios.isAxiosError(error) && error.response?.status === 409) {
                    router.replace('/login')
                }
            },
        })
    }

    const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null

        if (!file) {
            setSelectedLogo(null)
            setLogoError(null)
            return
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']

        if (!allowedTypes.includes(file.type)) {
            setSelectedLogo(null)
            setLogoError('Selecione um arquivo PNG, JPG ou WEBP.')
            event.target.value = ''
            return
        }

        setSelectedLogo(file)
        setLogoError(null)
    }

    const mutationErrorMessage = useMemo(() => {
        if (!setupMutation.isError) {
            return null
        }

        if (axios.isAxiosError(setupMutation.error)) {
            if (setupMutation.error.response?.status === 409) {
                return 'O setup inicial já foi concluído.'
            }

            if (setupMutation.error.response?.status === 422) {
                return 'Verifique os dados informados e tente novamente.'
            }

            if (setupMutation.error.response?.status === 400) {
                return setupMutation.error.response?.data?.message || 'O logo enviado é inválido.'
            }
        }

        return 'Não foi possível concluir o setup.'
    }, [setupMutation.error, setupMutation.isError])

    const shouldShowLoading =
        !isHydrated ||
        !!token ||
        setupStatusQuery.isPending ||
        (setupStatusQuery.data && !setupStatusQuery.data.setupRequired)

    if (shouldShowLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e1629] to-[#1f2a44] px-4 text-white">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando...</span>
                </div>
            </main>
        )
    }

    if (setupStatusQuery.isError) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e1629] to-[#1f2a44] px-4 text-white">
                <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center backdrop-blur-sm">
                    <h1 className="text-xl font-semibold">Falha ao carregar o setup</h1>
                    <p className="mt-2 text-sm text-red-100">
                        Não foi possível verificar se o sistema ainda precisa da configuração inicial.
                    </p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e1629] to-[#1f2a44] px-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 border border-white/10 dark:border-gray-700 rounded-2xl shadow-2xl p-8"
            >
                <div className="mb-6 flex justify-center">
                    <BrandMark
                        titleClassName="text-2xl"
                        size={48}
                        overrideLogoUrl={logoPreviewUrl ?? null}
                        overrideTitle={watchedBrandName || DEFAULT_BRAND_NAME}
                    />
                </div>
                <h1 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">
                    Configuração inicial
                </h1>
                <p className="text-sm text-center text-gray-300 mb-6">
                    Crie o primeiro acesso administrador do sistema.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-gray-200">Logo do sistema</p>
                                <p className="text-xs text-gray-400">
                                    Opcional. PNG, JPG ou WEBP.
                                </p>
                            </div>
                            {selectedLogo && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedLogo(null)
                                        setLogoError(null)
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Remover
                                </button>
                            )}
                        </div>

                        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-600 bg-white/5 px-4 py-4 text-sm font-medium text-gray-200 hover:border-blue-400 hover:text-white">
                            <ImagePlus className="h-4 w-4" />
                            {selectedLogo ? selectedLogo.name : 'Selecionar logo'}
                            <input
                                key={selectedLogo ? `${selectedLogo.name}-${selectedLogo.lastModified}` : 'logo-input'}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={handleLogoChange}
                            />
                        </label>

                        {logoError && (
                            <p className="mt-2 text-sm text-red-400">{logoError}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nome do sistema</label>
                        <input
                            type="text"
                            {...register('brandName')}
                            className="w-full rounded-lg px-4 py-2 bg-gray-100/10 border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome do chatbot"
                        />
                        {errors.brandName && (
                            <p className="mt-1 text-sm text-red-400">{errors.brandName.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                        <input
                            type="text"
                            {...register('name')}
                            className="w-full rounded-lg px-4 py-2 bg-gray-100/10 border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome do administrador"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full rounded-lg px-4 py-2 bg-gray-100/10 border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="email@exemplo.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className="w-full rounded-lg px-4 py-2 pr-10 bg-gray-100/10 border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                        )}
                    </div>

                    <AnimatePresence>
                        {mutationErrorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="text-sm text-red-400 bg-red-400/10 border border-red-500/30 px-3 py-2 rounded-lg"
                            >
                                {mutationErrorMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={setupMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white font-semibold transition-all bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {setupMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {setupMutation.isPending ? 'Configurando...' : 'Criar primeiro acesso'}
                    </button>
                </form>
            </motion.div>
        </main>
    )
}
