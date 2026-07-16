// src/components/ToggleSwitch.tsx

import React from 'react'
import clsx from 'clsx'

type ToggleSwitchProps = {
    checked: boolean
    onChange: (value: boolean) => void
    label?: string
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={clsx(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
                    checked ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'
                )}
            >
        <span
            className={clsx(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                checked ? 'translate-x-6' : 'translate-x-1'
            )}
        />
            </button>
            {label && <span className="text-sm text-white dark:text-gray-200">{label}</span>}
        </div>
    )
}