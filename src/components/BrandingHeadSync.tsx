'use client'

import { useEffect } from 'react'
import { useBranding } from '@/hooks/useBranding'
import { DEFAULT_BRAND_NAME, resolveBrandName } from '@/lib/branding'

const FAVICON_LINKS = [
    { rel: 'icon', key: 'icon' },
    { rel: 'shortcut icon', key: 'shortcut' },
    { rel: 'apple-touch-icon', key: 'apple' },
] as const

function inferIconType(iconHref: string) {
    if (iconHref.endsWith('.png')) {
        return 'image/png'
    }

    if (iconHref.endsWith('.webp')) {
        return 'image/webp'
    }

    if (iconHref.endsWith('.svg')) {
        return 'image/svg+xml'
    }

    if (iconHref.endsWith('.ico')) {
        return 'image/x-icon'
    }

    return undefined
}

export function BrandingHeadSync() {
    const brandingQuery = useBranding()

    useEffect(() => {
        const brandName = resolveBrandName(
            brandingQuery.data?.brandName,
            DEFAULT_BRAND_NAME,
        )

        document.title = brandName
    }, [brandingQuery.data?.brandName])

    useEffect(() => {
        const iconHref = brandingQuery.data?.logoUrl ?? '/favicon.ico'
        const iconType = inferIconType(iconHref)

        for (const { rel, key } of FAVICON_LINKS) {
            const selector = `link[rel="${rel}"], link[data-branding-icon="${key}"]`
            const existingLinks = Array.from(
                document.head.querySelectorAll<HTMLLinkElement>(selector),
            )
            const linksToUpdate =
                existingLinks.length > 0 ? existingLinks : [document.createElement('link')]

            for (const link of linksToUpdate) {
                link.setAttribute('data-branding-icon', key)
                link.rel = rel
                link.href = iconHref

                if (iconType) {
                    link.type = iconType
                } else {
                    link.removeAttribute('type')
                }

                if (!link.parentNode) {
                    document.head.appendChild(link)
                }
            }
        }
    }, [brandingQuery.data?.logoUrl])

    return null
}
