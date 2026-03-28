"use client"

import InventoryManager from "@/components/inventory/InventoryManager"
import { PageShell } from "@/components/PageShell"

/**
 * ⚡ INSTANT INVENTORY PAGE
 * This page is now a synchronous client shell.
 * It mounts immediately upon navigation (0ms delay).
 * Data is retrieved from the global pre-loaded cache in Providers.tsx.
 */
export default function InventoryPage() {
    return (
        <PageShell>
            <InventoryManager />
        </PageShell>
    )
}
