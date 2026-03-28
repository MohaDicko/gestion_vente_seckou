"use client"

import { AuthProvider } from "@/hooks/useAuth"
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"

/**
 * 🚀 GLOBAL DATA PRELOADER
 * Hits all core API routes simultaneously at app startup.
 * Ensures that subsequent page navigations find their data ALREADY in cache.
 */
function DataPreloader({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()
    const [preloaded, setPreloaded] = useState(false)

    useEffect(() => {
        if (preloaded) return

        const prefetchCoreData = async () => {
            console.log("⚡ [Sekou-Speed] Prefetching all business modules for instant nav...")
            
            // Prefetch in parallel to saturate the connection quickly
            await Promise.allSettled([
                queryClient.prefetchQuery({
                    queryKey: ['products'],
                    queryFn: () => fetch('/api/products').then(res => res.json()),
                }),
                queryClient.prefetchQuery({
                    queryKey: ['dashboard-stats'],
                    queryFn: () => fetch('/api/dashboard/stats').then(res => res.json()),
                }),
                queryClient.prefetchQuery({
                    queryKey: ['pos-insurances'],
                    queryFn: () => fetch('/api/insurances').then(res => res.json()),
                }),
                 queryClient.prefetchQuery({
                    queryKey: ['dashboard-reports'],
                    queryFn: () => fetch('/api/dashboard/reports').then(res => res.json()),
                })
            ])
            
            setPreloaded(true)
            console.log("✅ [Sekou-Speed] Core data pre-cached. Navigation will be near-instant.")
        }

        prefetchCoreData()
    }, [queryClient, preloaded])

    return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 10, // 10 minutes (keep active in memory)
                gcTime: 1000 * 60 * 60,    // 1 hour
                refetchOnMount: false,     // Avoid refetching when navigating back
                refetchOnWindowFocus: false,
                retry: 2,
            },
        },
    }))

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <DataPreloader>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </DataPreloader>
            </QueryClientProvider>
        </SessionProvider>
    )
}
