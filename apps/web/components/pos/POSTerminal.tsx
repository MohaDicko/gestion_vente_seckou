"use client"

import { useState, useMemo, memo } from "react"
import {
    Search, ShoppingCart, Plus, Minus, CreditCard,
    ScanBarcode, Loader2, CheckCircle2
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useInventory } from "@/hooks/useInventory"
import { usePOS } from "@/hooks/usePOS"
import { Product } from "@/types"

// ── Shared Sub-components ──────────────────────────────────────────────
const CatalogItem = memo(({ product, onAdd }: { product: Product, onAdd: (p: Product) => void }) => (
    <button onClick={() => onAdd(product)} disabled={product.stock <= 0}
        className={cn("text-left p-4 rounded-2xl bg-white border border-slate-100 shadow-soft transition-all active:scale-95 group relative overflow-hidden",
            product.stock <= 0 ? "opacity-50 grayscale" : "hover:border-primary hover:shadow-modern")}>
        <div className="mb-2">
            <div className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{product.name}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{product.material}</div>
        </div>
        <div className="text-lg font-black text-primary">{product.sellingPrice.toLocaleString()} F</div>
        <div className={cn("mt-1 text-[9px] font-black uppercase tracking-tighter", product.stock <= 5 ? "text-amber-500" : "text-slate-300")}>
            {product.stock <= 0 ? "Épuisé" : `Dispo: ${product.stock}${product.unit === 'METRE' ? 'm' : ''}`}
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-10 transition-opacity">
            <ShoppingCart className="w-8 h-8" />
        </div>
    </button>
))

// ── Main POS Terminal ──────────────────────────────────────────────────
export default function POSTerminal() {
    const { products, loading } = useInventory()
    const { cart, addToCart, updateQuantity, clearCart, totalTTC, processCheckout, isProcessing } = usePOS()
    
    const [searchQuery, setSearchQuery] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    const filteredCatalog = useMemo(() => 
        products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.material.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => (a.stock > 0 ? -1 : 1)).slice(0, 48)
    , [products, searchQuery])

    const handleFinalCheckout = async () => {
        try {
            await processCheckout({ paymentMethod: 'CASH' })
            setIsSuccess(true)
        } catch {}
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500 gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
                {/* ── LEFT: CATALOG (8/12) ── */}
                <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between">
                         <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Terminal <span className="text-primary italic">POS</span></h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-60">Saisie des Ventes Directes</p>
                         </div>
                         <div className="relative group">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                             <Input 
                                placeholder="Scannez ou recherchez un article..." 
                                className="pl-12 w-64 md:w-96 h-12 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all text-slate-900 font-bold"
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                             />
                         </div>
                    </div>

                    <ScrollArea className="flex-1 bg-slate-50/50 rounded-[2.5rem] border border-slate-200/40 p-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                             {filteredCatalog.map(p => (
                                <CatalogItem key={p.id} product={p} onAdd={addToCart} />
                             ))}
                             {!loading && filteredCatalog.length === 0 && (
                                <div className="col-span-full h-80 flex flex-col items-center justify-center text-slate-200">
                                    <ScanBarcode className="w-20 h-20 mb-4 opacity-10" strokeWidth={1} />
                                    <p className="font-black text-xs uppercase tracking-[0.3em] opacity-20">Aucun produit trouvé</p>
                                </div>
                             )}
                        </div>
                    </ScrollArea>
                </div>

                {/* ── RIGHT: CART PANEL (4/12) ── */}
                <div className="lg:col-span-4 bg-white rounded-[3rem] border border-slate-200/60 shadow-premium-lg flex flex-col overflow-hidden">
                    {isSuccess ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 gap-6 text-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-12 h-12" strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Vente Validée !</h2>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Le ticket de caisse a été généré</p>
                            </div>
                            <Button className="mt-4 rounded-2xl px-12 h-14 bg-slate-900 font-black shadow-modern scale-100 active:scale-95 transition-all" 
                                onClick={() => { setIsSuccess(false); clearCart(); }}>
                                Nouvelle Vente
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="font-black text-slate-900 flex items-center gap-3 text-lg">
                                    <ShoppingCart className="w-6 h-6 text-primary" strokeWidth={2.5} /> Détail Panier
                                </h2>
                                <Badge className="bg-slate-900 text-[10px] font-black rounded-full px-3">{cart.length}</Badge>
                            </div>

                            <ScrollArea className="flex-1 p-8">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-20 mt-20">
                                        <ShoppingCart className="w-24 h-24 mb-4" strokeWidth={0.5} />
                                        <p className="text-xs font-black uppercase tracking-[0.4em]">Panier Vide</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center justify-between animate-in slide-in-from-right-4 duration-300">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <p className="text-sm font-black text-slate-900 truncate leading-tight">{item.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{item.sellingPrice.toLocaleString()} F {item.dimensions && `· ${item.dimensions}`}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:text-rose-500 transition-colors"><Minus className="w-3 h-3" strokeWidth={3} /></button>
                                                        <span className="w-6 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:text-emerald-500 transition-colors"><Plus className="w-3 h-3" strokeWidth={3} /></button>
                                                    </div>
                                                    <div className="text-sm font-black text-slate-900 w-24 text-right">{(item.sellingPrice * item.quantity).toLocaleString()} F</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>

                            <div className="p-10 bg-slate-50/50 space-y-6">
                                <Separator className="bg-slate-200/50" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total à Régler</span>
                                        <span className="text-4xl font-black text-slate-900 tracking-tighter">{totalTTC.toLocaleString()} F</span>
                                    </div>
                                </div>
                                <Button size="lg" className="w-full h-16 rounded-[1.5rem] bg-primary text-white shadow-modern-lg font-black text-lg hover:bg-primary/90 transition-all active:scale-[0.98]" 
                                    disabled={cart.length === 0 || isProcessing} onClick={handleFinalCheckout}>
                                    {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : <><CreditCard className="mr-3 w-6 h-6" strokeWidth={2.5} /> VALIDER LE PAIEMENT</>}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
