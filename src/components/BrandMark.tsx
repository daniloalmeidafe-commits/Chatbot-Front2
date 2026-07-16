'use client'

import clsx from 'clsx'
import { MessageCircle } from 'lucide-react'
import { useBranding } from '@/hooks/useBranding'
import { DEFAULT_BRAND_NAME, resolveBrandName } from '@/lib/branding'

type BrandMarkProps = {
    title?: string
    className?: string
    badgeClassName?: string
    titleClassName?: string
    size?: number
    overrideLogoUrl?: string | null
    overrideTitle?: string | null
}

export function BrandMark({
    title,
    className,
    badgeClassName,
    titleClassName,
    size = 40,
    overrideLogoUrl,
    overrideTitle,
}: BrandMarkProps) {
    const brandingQuery = useBranding({
        enabled: overrideLogoUrl === undefined || overrideTitle === undefined,
    })

    const logoUrl =
        overrideLogoUrl === undefined
            ? brandingQuery.data?.logoUrl ?? null
            : overrideLogoUrl
    const fallbackBrandName = resolveBrandName(
        brandingQuery.data?.brandName,
        title ?? DEFAULT_BRAND_NAME,
    )
    const brandName = resolveBrandName(overrideTitle, fallbackBrandName)

    return (
        <div className={clsx('flex items-center gap-3', className)}>
            <div
                className={clsx(
                    'flex shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm',
                    logoUrl ? 'bg-white/95 p-1' : 'bg-blue-600',
                    badgeClassName,
                )}
                style={{ width: size, height: size }}
            >
                {logoUrl ? (
                    // Using a plain image element keeps the branding logo independent
                    // from Next remote image configuration and API domain changes.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={logoUrl}
                        alt={`${brandName} logo`}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <MessageCircle className="text-white" size={Math.round(size * 0.5)} />
                )}
            </div>
            <span className={clsx('font-bold text-white', titleClassName)}>
                {brandName}
            </span>
        </div>
    )
}
