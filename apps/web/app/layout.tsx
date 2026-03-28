import { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { ClientLayout } from "./client-layout"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: {
        default: "Sekou - Gestion de Vente (Rideaux & Draps)",
        template: "%s | Sekou Draperie"
    },
    description: "Système de Gestion de Vente - Sekou Rideaux & Draps",
    keywords: ["draps", "rideaux", "gestion de stock", "Mali", "Sekou", "POS", "draperie"],
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Sekou Draperie",
    },
}

export const viewport = {
    themeColor: "#0ea5e9",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" className="h-full" suppressHydrationWarning={true}>
            <body className={`${inter.className} h-full bg-background font-sans antialiased`}>
                <Providers>
                    <ClientLayout>
                        {children}
                    </ClientLayout>
                </Providers>
            </body>
        </html>
    )
}
