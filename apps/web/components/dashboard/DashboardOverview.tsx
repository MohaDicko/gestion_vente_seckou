"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    DollarSign, AlertTriangle, PackageSearch, Loader2,
    ShoppingCart, Scissors, ArrowUpRight, CalendarDays
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts'
import { cn } from "@/lib/utils"
import { useDashboard, DashboardStats, ReportData } from "@/hooks/useDashboard"
import { memo } from "react"

// ── Shared UI Sub-components ──────────────────────────────────────────
const StatCard = memo(({ title, value, subtitle, icon: Icon, trend, isMain = false }: {
    title: string, value: string, subtitle: string,
    icon: React.ElementType, trend?: string, isMain?: boolean
}) => (
    <Card className={isMain ? "bg-slate-900 border-none shadow-premium-lg ring-1 ring-white/10" : "bg-white border-slate-200/60 shadow-soft hover:shadow-modern transition-all duration-300 overflow-hidden"}>
        <CardContent className="p-6">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isMain ? "text-slate-400" : "text-slate-500 opacity-60")}>
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className={cn("text-3xl font-black tracking-tighter", isMain ? "text-white" : "text-slate-900")}>
                            {value}
                        </h3>
                        {trend && (
                            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                                {trend}
                            </span>
                        )}
                    </div>
                    <p className={cn("text-[11px] font-medium opacity-60", isMain ? "text-slate-400" : "text-slate-500")}>
                        {subtitle}
                    </p>
                </div>
                <div className={cn("p-4 rounded-2xl flex items-center justify-center", isMain ? "bg-white/10 text-white" : "bg-slate-50 text-slate-900")}>
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
            </div>
        </CardContent>
    </Card>
))

// ── Main Executive Dashboard ──────────────────────────────────────────
export default function DashboardOverview({ initialStats, initialReports }: { initialStats?: DashboardStats, initialReports?: ReportData }) {
    const { stats, reports, loading } = useDashboard(initialStats, initialReports)
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
        )
    }

    const dailyRevenue = stats?.revenueToday || 0
    const invValue = stats?.stockValue || 0
    const stockIssues = stats?.outOfStockCount || 0
    const totalRefs = stats?.stockCount || 0
    const incomingFlow = stats?.recentDeliveries || []

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* ── HEADER ──────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Intelligence Commerciale</p>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                        Sekou <span className="font-light text-slate-300 italic">Vision</span>
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <CalendarDays className="w-3.5 h-3.5 text-primary" />
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                   <Button size="sm" variant="ghost" className="rounded-xl font-bold text-slate-400 hover:text-slate-900 h-10 px-6">Rapports Complets</Button>
                   <Link href="/pos">
                        <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black px-10 h-12 shadow-modern-lg transition-all scale-100 active:scale-95">
                            Terminal de Vente
                        </Button>
                   </Link>
                </div>
            </div>

            {/* ── KPI HIGHLIGHTS ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Ventes du Jour" value={`${dailyRevenue.toLocaleString()} F`} subtitle="Chiffre d'affaire actuel" icon={DollarSign} trend="+15.4%" isMain={true} />
                <StatCard title="Valeur Atelier" value={`${invValue.toLocaleString()} F`} subtitle="Actifs immobilisés" icon={Scissors} />
                <StatCard title="Catalogue Actif" value={`${totalRefs}`} subtitle="Références monitorées" icon={PackageSearch} />
                <StatCard title="Points Critiques" value={`${stockIssues}`} subtitle="Ruptures de stock" icon={AlertTriangle} trend={stockIssues > 0 ? "Urgent" : undefined} />
            </div>

            {/* ── VISUAL ANALYTICS ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-slate-200/60 shadow-premium-lg rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Flux de Trésorerie</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ventes hebdomadaires cumulées</CardDescription>
                            </div>
                            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-xl">
                                <Badge className="bg-slate-900 text-[9px] font-black rounded-lg">7 Jours</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reports?.trends || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'black', padding: '15px'}} />
                                    <Bar dataKey="ventes" fill="#0f172a" radius={[10, 10, 0, 0]} barSize={45} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-premium-lg rounded-[2.5rem] overflow-hidden bg-white">
                    <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/20">
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Flux Stocks</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Derniers arrivages validés</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="space-y-1">
                            {incomingFlow.length > 0 ? (
                                incomingFlow.map((flow, i) => (
                                    <div key={i} className="p-5 hover:bg-slate-50/80 transition-all rounded-[1.5rem] flex items-center justify-between group mx-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary transition-all border border-transparent shadow-sm">
                                                <PackageSearch className="w-5 h-5" strokeWidth={2} />
                                            </div>
                                            <div className="min-w-0 pr-4">
                                                <p className="text-[13px] font-black text-slate-900 truncate">{flow.productName}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">{flow.batchNumber}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3 py-1 rounded-lg">
                                            +{flow.quantity}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="p-32 text-center opacity-10">
                                    <ShoppingCart className="w-16 h-16 mx-auto mb-4" strokeWidth={0.5} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Aucun Flux</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
