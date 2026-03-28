import { useQuery } from '@tanstack/react-query'

export interface DashboardStats {
    revenueToday: number
    stockValue: number
    stockCount: number
    outOfStockCount: number
    recentDeliveries: Array<{
        productName: string
        batchNumber: string
        receivedDate: string
        quantity: number
    }>
}

export interface ReportData {
    trends: Array<{ name: string, ventes: number }>
    payments: Array<{ name: string, value: number }>
}

export function useDashboard(initialStats?: DashboardStats, initialReports?: ReportData) {
    const statsQuery = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await fetch('/api/dashboard/stats')
            if (!res.ok) throw new Error("Erreur stats")
            return res.json()
        },
        initialData: initialStats,
        staleTime: 1000 * 60 * 2,
    })

    const reportsQuery = useQuery<ReportData>({
        queryKey: ['dashboard-reports'],
        queryFn: async () => {
            const res = await fetch('/api/dashboard/reports')
            if (!res.ok) throw new Error("Erreur rapports")
            return res.json()
        },
        initialData: initialReports,
        staleTime: 1000 * 60 * 5,
    })

    return {
        stats: statsQuery.data,
        reports: reportsQuery.data,
        loading: statsQuery.isLoading || reportsQuery.isLoading,
        error: statsQuery.error || reportsQuery.error,
        refresh: () => {
            statsQuery.refetch()
            reportsQuery.refetch()
        }
    }
}
