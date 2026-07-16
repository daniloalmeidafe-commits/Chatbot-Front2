import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import QueryClientWrapper from '../providers/QueryClientProvider'
import { BrandingHeadSync } from '@/components/BrandingHeadSync'
import { ToasterProvider } from '@/components/ToasterProvider'
import { DEFAULT_BRAND_NAME, resolveBrandName } from '@/lib/branding'
import React from "react";
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'

type BrandingMetadataResponse = {
    data?: {
        brandName?: string | null
        logoUrl?: string | null
    }
}

function normalizeServerLogoUrl(logoUrl?: string | null) {
    if (!logoUrl) {
        return null
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiBaseUrl) {
        return logoUrl
    }

    try {
        const parsedLogoUrl = new URL(logoUrl, apiBaseUrl)

        return new URL(
            `${parsedLogoUrl.pathname}${parsedLogoUrl.search}`,
            apiBaseUrl,
        ).toString()
    } catch {
        return logoUrl
    }
}

async function getBrandingMetadata() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiBaseUrl) {
        return {
            brandName: DEFAULT_BRAND_NAME,
            logoUrl: null,
        }
    }

    try {
        const response = await fetch(`${apiBaseUrl}/api/v1/public/branding`, {
            next: { revalidate: 60 },
        })

        if (!response.ok) {
            throw new Error(`Failed with status ${response.status}`)
        }

        const payload = (await response.json()) as BrandingMetadataResponse

        return {
            brandName: resolveBrandName(
                payload.data?.brandName,
                DEFAULT_BRAND_NAME,
            ),
            logoUrl: normalizeServerLogoUrl(payload.data?.logoUrl),
        }
    } catch {
        return {
            brandName: DEFAULT_BRAND_NAME,
            logoUrl: null,
        }
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const branding = await getBrandingMetadata()

    return {
        title: branding.brandName,
        description: 'Automação de conversas e gestão de atendimentos',
        icons: branding.logoUrl
            ? {
                  icon: branding.logoUrl,
                  shortcut: branding.logoUrl,
                  apple: branding.logoUrl,
              }
            : undefined,
    }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className="font-poppins">
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                    <QueryClientWrapper>
                        <BrandingHeadSync />
                        {children}
                        <ToasterProvider />
                    </QueryClientWrapper>
                </ThemeProvider>
            </body>
        </html>
    )
}
