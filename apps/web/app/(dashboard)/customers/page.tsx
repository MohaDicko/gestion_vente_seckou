"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
    Users, Plus, Pencil, Power, Loader2, UserCheck, Phone, Mail, MapPin
} from "lucide-react"
import { toast } from "@/components/ui/toast"
import { PageShell } from "@/components/PageShell"

interface Customer {
    id: string
    name: string
    phone: string | null
    email: string | null
    address: string | null
    category: string
    status: 'ACTIF' | 'INACTIF'
    _count?: { transactions: number }
}

const emptyForm = { name: '', phone: '', email: '', address: '', category: 'DÉTAILLANT' }

export default function CustomersPage() {
    const { user } = useAuth()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Customer | null>(null)
    const [form, setForm] = useState(emptyForm)

    const isAdmin = user?.role === 'ADMIN'

    async function fetchCustomers() {
        setLoading(true)
        try {
            const res = await fetch('/api/customers')
            if (res.ok) setCustomers(await res.json())
        } catch { toast("Erreur chargement clients", 'error') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchCustomers() }, [])

    const openCreate = () => {
        setEditTarget(null)
        setForm(emptyForm)
        setDialogOpen(true)
    }

    const openEdit = (cust: Customer) => {
        setEditTarget(cust)
        setForm({ 
            name: cust.name, 
            phone: cust.phone ?? '', 
            email: cust.email ?? '', 
            address: cust.address ?? '', 
            category: cust.category 
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) { toast("Le nom est requis", 'warning'); return }
        setSaving(true)
        try {
            const payload = { ...form }
            let res: Response
            if (editTarget) {
                res = await fetch(`/api/customers/${editTarget.id}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                })
            } else {
                res = await fetch('/api/customers', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                })
            }
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erreur serveur')

            if (editTarget) {
                setCustomers(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...data } : c))
                toast(`✅ "${data.name}" mis à jour !`, 'success')
            } else {
                setCustomers(prev => [...prev, data])
                toast(`✅ "${data.name}" ajouté !`, 'success')
            }
            setDialogOpen(false)
        } catch (e) {
            toast((e as Error).message, 'error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <PageShell>
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Users className="h-8 w-8 text-primary" />
                        Gestion des Clients Détaillants
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Suivi de votre clientèle fidèle et des acheteurs réguliers.</p>
                </div>
                {isAdmin && (
                    <Button className="gap-2 shadow-md" onClick={openCreate}>
                        <Plus className="h-4 w-4" /> Nouveau Client
                    </Button>
                )}
            </div>

            {/* ── Table ── */}
            <Card className="border-none shadow-md">
                <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                    <CardTitle className="text-sm font-bold">Base de Données Clients</CardTitle>
                    <CardDescription className="text-xs">Consultez et gérez vos clients et leur historique de fidélité.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                            <Users className="h-10 w-10 text-slate-200" />
                            <span className="text-sm font-medium">Aucun client enregistré.</span>
                            {isAdmin && <Button size="sm" variant="outline" onClick={openCreate}>Ajouter le premier</Button>}
                        </div>
                    ) : (
                        <Table className="min-w-[800px]">
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="pl-6">Identité du Client</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Adresse</TableHead>
                                    <TableHead className="text-center">Catégorie</TableHead>
                                    <TableHead className="text-center">Achats</TableHead>
                                    {isAdmin && <TableHead className="text-right pr-6">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((cust) => (
                                    <TableRow key={cust.id} className="hover:bg-slate-50">
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                                                    {cust.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{cust.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">ID: {cust.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {cust.phone && <div className="text-xs flex items-center gap-1.5"><Phone className="h-3 w-3" /> {cust.phone}</div>}
                                                {cust.email && <div className="text-xs flex items-center gap-1.5 font-medium"><Mail className="h-3 w-3" /> {cust.email}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs flex items-center gap-1.5 text-slate-500 max-w-[150px] truncate">
                                                <MapPin className="h-3 w-3 shrink-0" /> {cust.address || '—'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-[10px] font-black uppercase">
                                                {cust.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className="bg-emerald-50 text-emerald-700 font-black border-none">
                                                {cust._count?.transactions || 0}
                                            </Badge>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cust)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* ── Modal ── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editTarget ? 'Modifier Client' : 'Nouveau Client'}</DialogTitle>
                        <DialogDescription>Entrez les informations de contact du client.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nom complet *</Label>
                            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Jean Dupont" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Téléphone</Label>
                                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+221 ..." />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemple.com" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Adresse</Label>
                            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Dakar, Plateau..." />
                        </div>
                        <div className="grid gap-2">
                            <Label>Catégorie</Label>
                            <select 
                                className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            >
                                <option value="DÉTAILLANT">Détaillant</option>
                                <option value="GROSSISTE">Grossiste</option>
                                <option value="FIDÈLE">Client Fidèle</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editTarget ? 'Modifier' : 'Ajouter'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageShell>
    )
}
