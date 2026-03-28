"use client"

import POSTerminal from "@/components/pos/POSTerminal"
import { PageShell } from "@/components/PageShell"

/**
 * ⚡ INSTANT POS PAGE
 * Converted to a synchronous client shell for 0ms navigation.
 * All product data and insurance partners are pre-loaded in Providers.tsx.
 * The POS UI mounts instantly, then pulls the catalog from cache.
 */
export default function POSPage() {
    return (
        <PageShell>
            <POSTerminal />
        </PageShell>
    )
}
