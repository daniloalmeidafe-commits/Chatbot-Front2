export const DEFAULT_BRAND_NAME = 'Chatbot'

export function resolveBrandName(
    brandName?: string | null,
    fallback = DEFAULT_BRAND_NAME,
) {
    const normalizedBrandName = brandName?.trim()

    return normalizedBrandName && normalizedBrandName.length > 0
        ? normalizedBrandName
        : fallback
}
