'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { FileEdit, Radio } from 'lucide-react'

export function ProjectSidebarNav() {
    const pathname = usePathname()
    const { id } = useParams<{ id: string }>()

    const links = [
        {
            href: `/projects/${id}/settings`,
            label: 'Edição do projeto',
            icon: <FileEdit className="w-4 h-4" />,
        },
        {
            href: `/projects/${id}/broadcast/settings`,
            label: 'Configuração Broadcast',
            icon: <Radio className="w-4 h-4" />,
        },
    ]

    return (
        <aside className="w-full md:w-80 bg-gray-800 p-4 rounded-lg space-y-2">
            {links.map((link) => {
                const isActive = pathname === link.href
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-2 w-full text-left px-4 py-2 rounded transition ${
                            isActive
                                ? 'bg-purple-700 text-white font-medium'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {link.icon}
                        {link.label}
                    </Link>
                )
            })}
        </aside>
    )
}
