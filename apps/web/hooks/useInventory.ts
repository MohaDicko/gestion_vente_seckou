import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Product } from "@/types"
import { toast } from "@/components/ui/toast"

export function useInventory() {
    const queryClient = useQueryClient()

    // ── DATA FETCHING ──────────────────────────────────────────────────
    const { data: products = [], isLoading, error } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch('/api/products')
            if (!res.ok) throw new Error("Erreur de chargement")
            return res.json()
        },
        staleTime: 1000 * 60 * 5,
    })

    // ── MUTATIONS ──────────────────────────────────────────────────────
    const addMutation = useMutation({
        mutationFn: async (newProduct: any) => {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            })
            if (!res.ok) throw new Error("Erreur lors de l'ajout")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast("Produit ajouté avec succès")
        },
        onError: (err: any) => toast(err.message, 'error')
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error("Erreur lors de la suppression")
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast("Produit supprimé")
        },
        onError: (err: any) => toast(err.message, 'error')
    })

    return {
        products,
        loading: isLoading,
        error,
        addProduct: addMutation.mutateAsync,
        deleteProduct: deleteMutation.mutateAsync,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending
    }
}
