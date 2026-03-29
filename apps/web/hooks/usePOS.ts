import { useState, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Product } from "@/types"
import { toast } from "@/components/ui/toast"

export interface CartItem extends Product { quantity: number }

export function usePOS() {
    const queryClient = useQueryClient()
    const [cart, setCart] = useState<CartItem[]>([])
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    // ── Cart Manipulation ──────────────────────────────────────────────
    const addToCart = useCallback((product: Product) => {
        if (product.stock <= 0) return toast("Rupture de stock !", 'warning')
        setCart(current => {
            const existing = current.find(i => i.id === product.id)
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast("Quantité max atteinte", 'warning')
                    return current
                }
                return current.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...current, { ...product, quantity: 1 }]
        })
    }, [])

    const updateQuantity = useCallback((id: string, delta: number) => {
        setCart(current =>
            current.map(i => {
                if (i.id !== id) return i
                const newQty = i.quantity + delta
                return newQty <= 0 ? null : { ...i, quantity: newQty }
            }).filter(Boolean) as CartItem[]
        )
    }, [])

    const clearCart = useCallback(() => setCart([]), [])

    // ── Financial Meta ──────────────────────────────────────────────
    const totalTTC = cart.reduce((s, i) => s + i.sellingPrice * i.quantity, 0)

    // ── Operations ──────────────────────────────────────────────────
    const checkoutMutation = useMutation({
        mutationFn: async (paymentData: any) => {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
                    ...paymentData
                })
            })
            if (!res.ok) throw new Error("Erreur transaction")
            return res.json()
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
            clearCart()
            toast("Vente enregistrée")
            if (data.transactionId) window.open(`/pos/print/${data.transactionId}`, '_blank')
        },
        onError: (err: any) => toast(err.message, 'error')
    })

    return {
        cart,
        addToCart,
        updateQuantity,
        clearCart,
        totalTTC,
        processCheckout: checkoutMutation.mutateAsync,
        isProcessing: checkoutMutation.isPending
    }
}
