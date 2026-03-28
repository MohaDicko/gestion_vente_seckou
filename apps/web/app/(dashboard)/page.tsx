"use client"

import DashboardOverview from "@/components/dashboard/DashboardOverview"
import { PageShell } from "@/components/PageShell"

/**
 * ⚡ INSTANT DASHBOARD PAGE
 * Converted to a synchronous client shell for 0ms navigation.
 * All metrics and reports are pre-loaded in Providers.tsx.
 * The Dashboard UI mounts instantly, then pulls the stats from cache.
 */
export default function DashboardPage() {
    return (
        <PageShell>
            <DashboardOverview />
        </PageShell>
    )
}
