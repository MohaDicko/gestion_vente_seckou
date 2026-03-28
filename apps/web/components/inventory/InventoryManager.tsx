"use client"

import { useState, useMemo, memo } from "react"
import { useCsvExport } from "@/hooks/useCsvExport"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
    Card, CardContent
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, FileDown, Trash2, Edit2, PackagePlus, Loader2, ShoppingCart } from "lucide-react"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { TableSkeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useInventory } from "@/hooks/useInventory"
import { Product } from "@/types"

// ── Shared UI Sub-components ──────────────────────────────────────────
const StockBar = memo(({ stock, minThreshold, unit }: { stock: number; minThreshold: number; unit: string }) => {
    const pct = minThreshold > 0 ? Math.min((stock / (minThreshold * 3)) * 100, 100) : 100
    const color = stock <= 0 ? 'bg-rose-500' : stock <= minThreshold ? 'bg-amber-400' : 'bg-slate-900'
    const unitLabel = unit === 'METRE' ? 'm' : '/u'
    return (
        <div className="flex items-center gap-3">
            <span className={cn("font-black text-xs min-w-[45px]", stock <= 0 ? 'text-rose-600' : stock <= minThreshold ? 'text-amber-600' : 'text-slate-900')}>
                {stock}{unitLabel}
            </span>
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${pct}%` }} />
            </div>
        </div>
    )
})

const ProductRow = memo(({ product, onEdit, onDelete, onRestock, canDelete }: {
    product: Product, onEdit: (p: Product) => void, onDelete: (p: Product) => void, onRestock: (p: Product) => void, canDelete: boolean
}) => (
    <TableRow className="group transition-colors h-16 border-slate-100 hover:bg-slate-50/50">
        <TableCell className="pl-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary transition-all border border-transparent group-hover:border-slate-100 shadow-sm group-hover:shadow-modern">
                    <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                    <div className="font-bold text-slate-900 text-[13px] truncate max-w-[200px]" title={product.name}>{product.name}</div>
                    <div className="flex gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.material || '-'}</span>
                        {product.dimensions && <span className="text-[10px] text-primary font-black uppercase tracking-tighter">📏 {product.dimensions}</span>}
                    </div>
                </div>
            </div>
        </TableCell>
        <TableCell>
            <StockBar stock={product.stock} minThreshold={product.minThreshold} unit={product.unit} />
        </TableCell>
        <TableCell>
            <Badge variant="outline" className={cn("rounded-md border-none px-2 py-0.5 font-bold text-[10px] uppercase shadow-none",
                product.inventoryStatus === 'OK' ? 'bg-emerald-50 text-emerald-600' :
                product.inventoryStatus === 'LOW' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            )}>
                {product.inventoryStatus}
            </Badge>
        </TableCell>
        <TableCell className="font-black text-slate-900 text-[13px]">{product.sellingPrice.toLocaleString()} F</TableCell>
        <TableCell className="text-right pr-6">
            <div className="flex justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5 text-slate-400 hover:text-primary" onClick={() => onRestock(product)}>
                    <PackagePlus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600" onClick={() => onEdit(product)}>
                    <Edit2 className="h-4 w-4" />
                </Button>
                {canDelete && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600" onClick={() => onDelete(product)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </TableCell>
    </TableRow>
))

// ── Main Controller View ──────────────────────────────────────────────
export default function InventoryManager() {
    const { user } = useAuth()
    const { products, loading, addProduct, deleteProduct, isAdding, isDeleting } = useInventory()
    const [searchTerm, setSearchTerm] = useState("")

    const filteredProducts = useMemo(() => 
        products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.material.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm])

    // State for local interaction
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null)
    const [newProductForm, setNewProductForm] = useState({
        name: "", material: "", category: "Rideaux",
        sellingPrice: "", minThreshold: "5", dimensions: "", 
        color: "", unit: "METRE", initialQuantity: "", costPrice: "",
    })

    const handleCreate = async () => {
        await addProduct({
            ...newProductForm,
            sellingPrice: Number(newProductForm.sellingPrice),
            minThreshold: Number(newProductForm.minThreshold),
            initialQuantity: Number(newProductForm.initialQuantity || 0)
        })
        setIsAddModalOpen(false)
        setNewProductForm({ ...newProductForm, name: "", initialQuantity: "" })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
             {/* ── HEADER AREA ─────────────────────────────────── */}
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Stockage Intelligent</p>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Le Catalogue <span className="text-slate-300 italic font-light">Sekou</span></h1>
                </div>
                <div className="flex items-center gap-3">
                   <Button variant="outline" className="rounded-xl border-slate-200 font-bold px-5 bg-white shadow-soft" onClick={() => useCsvExport().downloadCsv(products)}>
                        <FileDown className="w-4 h-4 mr-2" /> Exporter CSV
                   </Button>
                   <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 shadow-modern" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Nouveau Produit
                   </Button>
                </div>
            </div>

            {/* ── METRIC TILES ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[ 
                    { l: 'Total Références', v: products.length, c: 'slate', icon: ShoppingCart },
                    { l: 'Besoins Réappro', v: products.filter(p => p.inventoryStatus === 'LOW').length, c: 'amber', icon: AlertTriangle },
                    { l: 'Ruptures Totales', v: products.filter(p => p.inventoryStatus === 'RUPTURE').length, c: 'rose', icon: Trash2 }
                 ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-soft-xl flex items-center justify-between">
                        <div>
                            <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60")}>{s.l}</p>
                            <p className="text-3xl font-black text-slate-900">{s.v}</p>
                        </div>
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", `bg-${s.c}-50 text-${s.c}-500 opacity-60`)}>
                             <s.icon className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                    </div>
                 ))}
            </div>

            {/* ── MAIN LEDGER TABLE ─────────────────────────────── */}
            <Card className="rounded-[2.5rem] border-slate-200/60 shadow-premium-lg overflow-hidden bg-white">
                <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row gap-6 bg-slate-50/20">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <Input 
                            placeholder="Rechercher une référence ou matière..." 
                            className="pl-12 h-12 bg-white border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <CardContent className="p-0">
                    {loading ? <TableSkeleton /> : (
                        <div className="overflow-x-auto px-2">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-100 h-14">
                                        <TableHead className="pl-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Article & Spécs</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[220px]">Disponibilité Salon</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix de Détail</TableHead>
                                        <TableHead className="pr-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Opérations</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map(p => (
                                        <ProductRow key={p.id} product={p} onEdit={()=>{}} onDelete={setDeleteCandidate} onRestock={()=>{}} canDelete={user?.role === 'ADMIN'} />
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <TableRow><TableCell colSpan={5} className="h-80 text-center text-slate-300 font-bold uppercase tracking-widest opacity-20"><ShoppingCart className="w-16 h-16 mx-auto mb-4" /> Aucun Produit Trouvé</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── MODALS & OVERLAYS ─────────────────────────────────── */}
            <Dialog open={!!deleteCandidate} onOpenChange={() => setDeleteCandidate(null)}>
                <DialogContent className="rounded-3xl border-none shadow-premium-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Confirmer la suppression</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            Voulez-vous vraiment retirer <span className="text-slate-900 font-bold">"{deleteCandidate?.name}"</span> ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setDeleteCandidate(null)}>Annuler</Button>
                        <Button variant="destructive" className="rounded-xl font-bold bg-rose-600" onClick={() => deleteCandidate && deleteProduct(deleteCandidate.id).then(()=>setDeleteCandidate(null))} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="animate-spin" /> : "Supprimer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] border-none shadow-premium-lg p-10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Nouveau Référence</DialogTitle>
                        <DialogDescription className="font-medium text-slate-400">Enregistrez un nouvel article textile dans votre inventaire.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-8 mt-8">
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Nom de l'article</Label>
                            <Input placeholder="Ex: Rideau Occultant" className="rounded-2xl border-slate-100 h-11 font-bold" value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Matière / Texture</Label>
                            <Input placeholder="Velours, Polyester, Coton" className="rounded-2xl border-slate-100 h-11 font-bold" value={newProductForm.material} onChange={e => setNewProductForm({...newProductForm, material: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Prix de Vente (F)</Label>
                            <Input type="number" placeholder="15000" className="rounded-2xl border-slate-100 h-11 font-bold" value={newProductForm.sellingPrice} onChange={e => setNewProductForm({...newProductForm, sellingPrice: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Stock Initial</Label>
                            <Input type="number" placeholder="20" className="rounded-2xl border-slate-100 h-11 font-bold" value={newProductForm.initialQuantity} onChange={e => setNewProductForm({...newProductForm, initialQuantity: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter className="mt-10">
                        <Button variant="ghost" className="rounded-xl font-bold text-slate-400" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
                        <Button className="rounded-xl bg-slate-900 font-black px-12 h-12 shadow-modern hover:bg-slate-800 transition-all scale-100 active:scale-95" onClick={handleCreate} disabled={isAdding}>
                            {isAdding ? <Loader2 className="animate-spin" /> : "Créer l'article"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
