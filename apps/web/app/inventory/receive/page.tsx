"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Schéma simplifié (types string partout pour éviter preprocess, conversion dans onSubmit)
const formSchema = z.object({
    productId: z.string().min(1, "Veuillez sélectionner un produit."),
    batchNumber: z.string().min(2, "Numéro de lot requis (min 2 car)."),
    quantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
        message: "Quantité doit être un nombre positif."
    }),
    costPrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
        message: "Prix doit être un nombre positif (ex: 12.50)."
    }),
    receivedDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Veuillez entrer une date valide.",
    })
})

type FormValues = z.infer<typeof formSchema>

interface Product {
    id: string
    name: string
    material: string
}

export default function ReceiveStockPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            productId: "",
            batchNumber: "",
            quantity: "",
            receivedDate: new Date().toISOString().split('T')[0],
            costPrice: ""
        }
    })

    // 1. Charger les produits
    useEffect(() => {
        async function loadProducts() {
            try {
                const res = await fetch('/api/products')
                if (res.ok) {
                    const data = await res.json()
                    setProducts(data)
                }
            } catch (e) {
                console.error("Erreur chargement produits", e)
            } finally {
                setLoadingProducts(false)
            }
        }
        loadProducts()
    }, [])

    // 2. Soumission
    const onSubmit = async (data: FormValues) => {
        setSuccessMessage(null)

        try {
            // Conversion explicite ici
            const payload = {
                items: [{
                    productId: data.productId,
                    batchNumber: data.batchNumber,
                    quantity: parseInt(data.quantity),
                    receivedDate: new Date(data.receivedDate).toISOString(),
                    costPrice: parseFloat(data.costPrice)
                }],
                supplier: "Fournisseur Standard (MVP)"
            }

            const res = await fetch('/api/purchases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const result = await res.json()

            if (!res.ok) throw new Error(result.error || "Erreur serveur")

            setSuccessMessage(`Succès ! Lot ${data.batchNumber} ajouté (Transaction #${result.transactionId})`)
            reset()

        } catch (error) {
            alert("Erreur: " + (error as Error).message);
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card className="shadow-lg border-2 border-primary/20">
                <CardHeader className="bg-muted/10">
                    <CardTitle>📦 Réception de Commande (Entrée Stock)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">

                    {successMessage && (
                        <Alert className="bg-green-100 border-green-500 text-green-800">
                            <AlertTitle>Opération Réussie</AlertTitle>
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Sélection Produit */}
                        <div className="space-y-2">
                            <Label htmlFor="productId">Produit</Label>
                            {loadingProducts ? (
                                <div className="text-muted-foreground text-sm flex items-center gap-2"><Loader2 className="animate-spin h-3 w-3" /> Chargement catalogue...</div>
                            ) : (
                                <select
                                    id="productId"
                                    {...register("productId")}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">-- Choisir un produit --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.material})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.productId && <p className="text-red-500 text-xs">{errors.productId.message}</p>}
                        </div>

                        {/* Ligne : Lot & Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="batchNumber">Numéro de Lot</Label>
                                <Input id="batchNumber" placeholder="Ex: LOT-1234" {...register("batchNumber")} />
                                {errors.batchNumber && <p className="text-red-500 text-xs">{errors.batchNumber.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="receivedDate">Date de Réception</Label>
                                <Input id="receivedDate" type="date" {...register("receivedDate")} />
                                {errors.receivedDate && <p className="text-red-500 text-xs">{errors.receivedDate.message}</p>}
                            </div>
                        </div>

                        {/* Ligne : Quantité & Prix */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantité Reçue</Label>
                                <Input id="quantity" type="number" placeholder="Ex: 50" {...register("quantity")} />
                                {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="costPrice">Coût Unitaire (Achat)</Label>
                                <Input id="costPrice" type="number" step="0.01" placeholder="Ex: 800" {...register("costPrice")} />
                                {errors.costPrice && <p className="text-red-500 text-xs">{errors.costPrice.message}</p>}
                            </div>
                        </div>

                        <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting || loadingProducts}>
                            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            {isSubmitting ? "Validation..." : "Valider l'Entrée en Stock"}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
