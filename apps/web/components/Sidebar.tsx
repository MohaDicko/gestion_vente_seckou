"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { ROLES } from "@/lib/constants"
import {
    LayoutDashboard,
    Settings,
    PackageSearch,
    Users2,
    ShoppingCart,
    History,
    LogOut,
    ShieldCheck,
    Store,
    TrendingUp,
    ScrollText,
    Building2,
    ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
    onClick?: () => void;
}

export function Sidebar({ className, onClick, ...props }: SidebarProps) {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const allNavItems = [
        { title: "Vue d'ensemble", href: "/", icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] },
        { title: "Caisse & Vente", href: "/pos", icon: ShoppingCart, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] },
        { title: "Stock Draperie", href: "/inventory", icon: PackageSearch, roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { title: "Historique Ventes", href: "/transactions", icon: History, roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { title: "Factures & Devis", href: "/reports/financial", icon: ScrollText, roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { title: "Analyses de Ventes", href: "/reports", icon: TrendingUp, roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { title: "Gestion Clients", href: "/customers", icon: Users2, roles: [ROLES.ADMIN, ROLES.MANAGER] },
        { title: "Partenaires & Comptes", href: "/insurances", icon: Building2, roles: [ROLES.ADMIN] },
        { title: "Gestion de l'Équipe", href: "/users", icon: ShieldCheck, roles: [ROLES.ADMIN] },
        { title: "Audit & Sécurité", href: "/audit", icon: ShieldCheck, roles: [ROLES.ADMIN] },
        { title: "Paramètres", href: "/settings", icon: Settings, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] },
    ]

    const userRole = user?.role || ROLES.MANAGER
    const visibleItems = allNavItems.filter(item => item.roles.includes(userRole))

    return (
        <nav className={cn("flex flex-col h-full bg-slate-50/20 border-r border-slate-200/50", className)} {...props}>
            <div className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
                {/* LOGO AREA */}
                <div className="px-2 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Store className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-sm font-black text-slate-900 leading-none">SEKOU</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Gestion Draperie</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">Menu Principal</p>
                    {visibleItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                onClick={onClick}
                                className={cn(
                                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200",
                                    isActive
                                        ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} strokeWidth={2.5} />
                                <span className="flex-1">{item.title}</span>
                                {isActive && (
                                    <div className="absolute left-[-1rem] w-1 h-5 bg-primary rounded-r-full" />
                                )}
                                <ChevronRight className={cn("w-3 h-3 opacity-0 group-hover:opacity-20 transition-opacity", isActive && "hidden")} />
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div className="p-4 p-b-8 mt-auto">
                <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/50 mb-4 overflow-hidden relative group">
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {user?.name.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{user?.role}</p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                         <ShieldCheck className="w-12 h-12" />
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 font-bold text-xs"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Déconnexion
                </Button>
            </div>
        </nav>
    )
}
