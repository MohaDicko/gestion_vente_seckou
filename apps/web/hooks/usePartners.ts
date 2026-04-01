import { useQuery } from "@tanstack/react-query"
import { toast } from "@/components/ui/toast"

export interface Partner {
    id: string
    name: string
    code: string | null
    percentage: number
    status: 'ACTIF' | 'INACTIF'
    _count?: { transactions: number }
}

export function usePartners() {
    // ── DATA FETCHING ──────────────────────────────────────────────────
    // Uses the same queryKey as prefetched in providers.tsx
    const { data: partners = [], isLoading, error } = useQuery<Partner[]>({
        queryKey: ['pos-partners'],
        queryFn: async () => {
            const res = await fetch('/api/partners')
            if (!res.ok) throw new Error("Erreur de chargement des partenaires")
            return res.json()
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    })

    const activePartners = partners.filter(p => p.status === 'ACTIF')

    return {
        partners,
        activePartners,
        loading: isLoading,
        error
    }
}
