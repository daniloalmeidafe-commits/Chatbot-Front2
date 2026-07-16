'use client'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const SweetAlert = withReactContent(Swal)

export function useSweetAlert() {
    const getThemeOptions = () => {
        const isDark = document.documentElement.classList.contains('dark')
        return {
            background: isDark ? '#1f2937' : '#fff', // bg-gray-800 or white
            color: isDark ? '#fff' : '#111827', // text-white or gray-900
        }
    }

    const baseOptions = {
        customClass: {
            popup: 'rounded-xl shadow-lg',
            confirmButton: 'bg-blue-600 m-4 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 text-white px-4 py-2 rounded-md',
            cancelButton: 'bg-gray-600 m-4 hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 text-white px-4 py-2 rounded-md',
        },
        buttonsStyling: false,
    }

    async function confirmDelete(itemName?: string) {
        const result = await SweetAlert.fire({
            ...baseOptions,
            ...getThemeOptions(),
            title: 'Tem certeza?',
            text: itemName
                ? `${itemName}`
                : 'Essa ação não poderá ser desfeita.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
        })

        return result.isConfirmed
    }

    async function confirmCustom({
                                     title,
                                     text,
                                     confirmButtonText = 'Confirmar',
                                     cancelButtonText = 'Cancelar',
                                     icon = 'question',
                                 }: {
        title: string
        text?: string
        confirmButtonText?: string
        cancelButtonText?: string
        icon?: 'warning' | 'info' | 'question' | 'error' | 'success'
    }) {
        const result = await SweetAlert.fire({
            ...baseOptions,
            ...getThemeOptions(),
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
        })

        return result.isConfirmed
    }

    return { confirmDelete, confirmCustom }
}