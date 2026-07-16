'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { User, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react'
import { useEffect, useState, Fragment } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

const breadcrumbNameMap: Record<string, { label: string }> = {
    'dashboard': { label: 'Dashboard' },
    'projects': { label: 'Projetos' },
    'users': { label: 'Usuários' },
    'copy': { label: 'Copys' },
    'templates': { label: 'Templates' },
    'settings': { label: 'Configurações' },
    'automations': { label: 'Automações' },
    'facebook-profiles': { label: 'Perfis' },
    'pages': { label: 'Páginas' },
    'audit': { label: 'Análise' },
    'new': { label: 'Novo' },
    'flowbuilder': { label: 'Editor de Fluxo' },
    'options': { label: 'Opções' },
    'import': { label: 'Importar' },
    'broadcast': { label: 'Broadcast'}
};

export function Topbar() {
    const { user, logout } = useAuthStore()
    const router = useRouter()
    const pathname = usePathname()

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const generateBreadcrumbs = () => {
        const pathSegments = pathname.split('/').filter(segment => segment);

        if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'dashboard')) {
            return <div className="font-semibold text-white flex items-center gap-2"><LayoutDashboard size={18} /><span>Dashboard</span></div>;
        }

        let currentPath = '';
        return (
            <nav className="flex items-center text-sm font-medium text-gray-400">
                <Link href="/dashboard" className="hover:text-white transition-colors">
                    <LayoutDashboard size={18} />
                </Link>

                {pathSegments.map((segment, index) => {
                    currentPath += `/${segment}`;
                    const isLast = index === pathSegments.length - 1;
                    const isNumeric = !isNaN(Number(segment));

                    let label = breadcrumbNameMap[segment]?.label;
                    if (isNumeric) {
                        label = `#${segment}`;
                    } else {
                        label = label || segment;
                    }

                    return (
                        <Fragment key={currentPath}>
                            <ChevronRight size={16} className="mx-1.5 flex-shrink-0" />
                            {isNumeric ? (
                                <span className={clsx("font-semibold", isLast ? "text-white" : "text-gray-400")}>{label}</span>
                            ) : (
                                <Link
                                    href={currentPath}
                                    className={clsx(
                                        "hover:text-white transition-colors",
                                        isLast ? "text-white font-semibold" : ""
                                    )}
                                >
                                    {label}
                                </Link>
                            )}
                        </Fragment>
                    );
                })}
            </nav>
        );
    };

    if (!mounted) return null

    return (
        <header
            className="sticky top-0 z-30 w-full bg-gray-900/70 backdrop-blur-sm border-b border-gray-800 px-6 py-3 flex items-center justify-between">
            <div className="text-lg">
                {generateBreadcrumbs()}
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="flex items-center gap-3 text-sm font-medium focus:outline-none group">
                            <Image
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=1d4ed8&color=fff&bold=true`}
                                alt="Avatar"
                                width={32}
                                height={32}
                                className="rounded-full ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all"
                            />
                            <span className="hidden sm:inline text-white font-semibold">
                                {user?.name}
                            </span>
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            sideOffset={5}
                            align="end"
                            className="z-50 mt-2 min-w-[180px] rounded-md bg-gray-800 shadow-lg border border-gray-700 p-1"
                        >
                            <DropdownMenu.Label className="px-2 py-1.5 text-xs text-gray-400">
                                Minha Conta
                            </DropdownMenu.Label>
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-2 py-2 text-sm text-gray-200 hover:bg-gray-700/50 cursor-pointer rounded-md focus:outline-none focus:bg-gray-700/50"
                                onClick={() => router.push('/profile')}
                            >
                                <User size={16}/>
                                Perfil
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator className="h-px bg-gray-700 my-1" />

                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-2 py-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer rounded-md focus:outline-none focus:bg-red-500/10"
                                onClick={() => {
                                    logout()
                                    router.push('/login')
                                }}
                            >
                                <LogOut size={16}/>
                                Sair
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </header>
    )
}
