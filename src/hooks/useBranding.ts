'use client'

import { useQuery } from '@tanstack/react-query'
import { BrandingService } from '@/services/branding.service'

export function useBranding(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ['branding'],
        queryFn: BrandingService.getBranding,
        enabled: options?.enabled ?? true,
        staleTime: 1000 * 60,
        retry: false,
    })
}
