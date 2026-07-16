import api from '@/lib/axios'

export type BrandingResponse = {
    brandName: string | null
    logoUrl: string | null
}

function normalizeLogoUrl(logoUrl: string | null): string | null {
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

export const BrandingService = {
    getBranding: async (): Promise<BrandingResponse> => {
        const response = await api.get('/api/v1/public/branding')
        const data = response.data.data as BrandingResponse

        return {
            ...data,
            logoUrl: normalizeLogoUrl(data.logoUrl),
        }
    },
}
