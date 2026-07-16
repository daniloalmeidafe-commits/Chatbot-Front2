// src/providers/ToasterProvider.tsx
'use client'

import { ToastContainer } from 'react-toastify'
import { useTheme } from 'next-themes'
import 'react-toastify/dist/ReactToastify.css'

export function ToasterProvider() {
    const { theme, systemTheme } = useTheme()
    const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')

    return (
        <ToastContainer
            position="top-right"
            theme={isDark ? 'dark' : 'light'}
            autoClose={4000}
        />
    )
}
