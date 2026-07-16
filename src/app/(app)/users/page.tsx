'use client'

import axios from 'axios'
import { Dialog } from '@headlessui/react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Shield, Trash2, UserRound } from 'lucide-react'
import { toast } from 'react-toastify'
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers, ManagedUser } from '@/hooks/useUsers'
import { useAuthStore } from '@/store/authStore'
import { RoleName } from '@/types/auth'
import { useSweetAlert } from '@/utils/useSweetAlert'

type UserFormState = {
    name: string
    email: string
    password: string
    role: RoleName
}

const initialFormState: UserFormState = {
    name: '',
    email: '',
    password: '',
    role: 'USER',
}

export default function UsersPage() {
    const router = useRouter()
    const { confirmDelete } = useSweetAlert()
    const currentUser = useAuthStore((state) => state.user)
    const [page, setPage] = useState(1)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
    const [form, setForm] = useState<UserFormState>(initialFormState)
    const [formError, setFormError] = useState<string | null>(null)

    const usersQuery = useUsers(page, 10)
    const createUserMutation = useCreateUser()
    const updateUserMutation = useUpdateUser()
    const deleteUserMutation = useDeleteUser()

    useEffect(() => {
        if (currentUser && currentUser.role?.name !== 'ADMIN') {
            router.replace('/dashboard')
        }
    }, [currentUser, router])

    useEffect(() => {
        if (!usersQuery.isLoading && usersQuery.data && usersQuery.data.response.length === 0 && page > 1) {
            setPage((previousPage) => previousPage - 1)
        }
    }, [page, usersQuery.data, usersQuery.isLoading])

    const visibleUsers = usersQuery.data?.response ?? []
    const isLoading = usersQuery.isLoading || usersQuery.isFetching
    const isAdmin = currentUser?.role?.name === 'ADMIN'
    const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending

    const title = editingUser ? 'Editar usuário' : 'Novo usuário'
    const submitLabel = editingUser ? 'Salvar alterações' : 'Criar usuário'

    const currentUserId = currentUser?.id

    const openCreateModal = () => {
        setEditingUser(null)
        setForm(initialFormState)
        setFormError(null)
        setIsModalOpen(true)
    }

    const openEditModal = (user: ManagedUser) => {
        setEditingUser(user)
        setForm({
            name: user.name ?? '',
            email: user.email ?? '',
            password: '',
            role: user.role?.name === 'ADMIN' ? 'ADMIN' : 'USER',
        })
        setFormError(null)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingUser(null)
        setForm(initialFormState)
        setFormError(null)
    }

    const validateForm = () => {
        if (!form.name.trim()) {
            return 'Informe o nome do usuário.'
        }

        if (!form.email.trim()) {
            return 'Informe o e-mail do usuário.'
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailPattern.test(form.email.trim())) {
            return 'Informe um e-mail válido.'
        }

        if (!editingUser && form.password.trim().length < 6) {
            return 'A senha deve ter pelo menos 6 caracteres.'
        }

        if (editingUser && form.password.trim().length > 0 && form.password.trim().length < 6) {
            return 'A nova senha deve ter pelo menos 6 caracteres.'
        }

        return null
    }

    const handleSubmit = () => {
        const validationError = validateForm()

        if (validationError) {
            setFormError(validationError)
            return
        }

        setFormError(null)

        if (editingUser) {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                ...(form.password.trim()
                    ? { password: form.password.trim() }
                    : {}),
                role: {
                    name: form.role,
                },
            }

            updateUserMutation.mutate(
                {
                    id: editingUser.id,
                    payload,
                },
                {
                    onSuccess: () => {
                        toast.success('Usuário atualizado com sucesso!')
                        closeModal()
                    },
                    onError: (error) => {
                        setFormError(getMutationErrorMessage(error))
                    },
                },
            )

            return
        }

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
            role: {
                name: form.role,
            },
        }

        createUserMutation.mutate(payload, {
            onSuccess: () => {
                toast.success('Usuário criado com sucesso!')
                closeModal()
            },
            onError: (error) => {
                setFormError(getMutationErrorMessage(error))
            },
        })
    }

    const handleDelete = async (user: ManagedUser) => {
        const confirmed = await confirmDelete(`Deseja excluir o usuário "${user.name ?? user.email}"?`)

        if (!confirmed) {
            return
        }

        deleteUserMutation.mutate(user.id, {
            onSuccess: () => {
                toast.success('Usuário excluído com sucesso!')
            },
            onError: (error) => {
                toast.error(getMutationErrorMessage(error))
            },
        })
    }

    const emptyStateMessage = useMemo(() => {
        if (isLoading) {
            return null
        }

        if (visibleUsers.length === 0) {
            return 'Nenhum usuário encontrado nesta página.'
        }

        return null
    }, [isLoading, visibleUsers.length])

    if (!currentUser) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="space-y-8 p-6 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Usuários</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Cadastre e gerencie os acessos administrativos e operacionais do sistema.
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    <Plus className="h-5 w-5" />
                    Novo usuário
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Usuário</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Papel</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Criado em</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {visibleUsers.map((user) => {
                                const isCurrentUser = user.id === currentUserId
                                const roleName = user.role?.name ?? 'USER'

                                return (
                                    <tr key={user.id} className="bg-gray-950/40">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-300">
                                                    <UserRound className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-white">{user.name ?? 'Sem nome'}</p>
                                                        {isCurrentUser && (
                                                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-300">
                                                                Você
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-400">{user.email ?? 'Sem e-mail'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    roleName === 'ADMIN'
                                                        ? 'bg-amber-500/10 text-amber-300'
                                                        : 'bg-slate-500/10 text-slate-300'
                                                }`}
                                            >
                                                <Shield className="h-3.5 w-3.5" />
                                                {roleName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{user.status ?? 'ACTIVE'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {!isCurrentUser ? (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-blue-500 hover:text-white"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            disabled={deleteUserMutation.isPending}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-60"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Excluir
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-500">
                                                        Gerencie sua conta em Perfil
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {emptyStateMessage && (
                    <div className="border-t border-gray-800 px-6 py-12 text-center text-sm text-gray-400">
                        {emptyStateMessage}
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-800 px-6 py-4">
                    <p className="text-sm text-gray-400">Página {page}</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                            disabled={page === 1 || isLoading}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage((currentPage) => currentPage + 1)}
                            disabled={!usersQuery.data?.hasNextPage || isLoading}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Próxima
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-6 text-white shadow-xl">
                        <Dialog.Title className="text-xl font-bold">{title}</Dialog.Title>
                        <p className="mt-1 text-sm text-gray-400">
                            {editingUser
                                ? 'Atualize os dados do usuário selecionado.'
                                : 'Preencha os dados para criar um novo acesso.'}
                        </p>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="user-name" className="mb-1 block text-sm font-medium text-gray-300">
                                    Nome
                                </label>
                                <input
                                    id="user-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, name: event.target.value }))}
                                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="user-email" className="mb-1 block text-sm font-medium text-gray-300">
                                    E-mail
                                </label>
                                <input
                                    id="user-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, email: event.target.value }))}
                                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="user-password" className="mb-1 block text-sm font-medium text-gray-300">
                                    Senha
                                </label>
                                <input
                                    id="user-password"
                                    type="password"
                                    value={form.password}
                                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, password: event.target.value }))}
                                    placeholder={editingUser ? 'Deixe em branco para manter a senha atual' : 'Mínimo de 6 caracteres'}
                                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="user-role" className="mb-1 block text-sm font-medium text-gray-300">
                                    Papel
                                </label>
                                <select
                                    id="user-role"
                                    value={form.role}
                                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, role: event.target.value as RoleName }))}
                                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            {formError && (
                                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                                    {formError}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="rounded-lg bg-gray-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitLabel}
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    )
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(date))
}

function getMutationErrorMessage(error: unknown) {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
            return 'Você não pode gerenciar a própria conta por esta tela.'
        }

        if (error.response?.status === 422) {
            return 'Verifique os dados informados e tente novamente.'
        }

        if (error.response?.status === 401) {
            return 'Sua sessão expirou. Faça login novamente.'
        }

        if (error.response?.data?.message) {
            return error.response.data.message
        }
    }

    return 'Não foi possível concluir a operação.'
}
