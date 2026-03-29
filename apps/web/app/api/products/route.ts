import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ─── GET : Liste tous les produits avec stock calculé ──────────────────────
export async function GET() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }
        
        const products = await prisma.product.findMany({
            where: { status: 'ACTIF' },
            orderBy: { name: 'asc' },
            include: {
                batches: {
                    where: {
                        quantity: { gt: 0 }
                    }
                }
            }
        });

        const result = products.map((product) => {
            const totalStock = product.batches.reduce((sum, batch) => sum + batch.quantity, 0);
            const lastReceivedDate = product.batches.length > 0
                ? product.batches.reduce((max, b) => b.receivedDate > max ? b.receivedDate : max, product.batches[0].receivedDate)
                : null;

            let inventoryStatus = 'OK';
            if (totalStock <= 0) inventoryStatus = 'RUPTURE';
            else if (totalStock <= product.minThreshold) inventoryStatus = 'LOW';

            return {
                ...product,
                stock: totalStock,
                sellingPrice: Number(product.sellingPrice),
                inventoryStatus,
                lastReceived: lastReceivedDate ? lastReceivedDate.toISOString() : null,
                batchesCount: product.batches.length
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Products GET Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

// ─── POST : Créer un produit + son lot de stock initial ────────────────────
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role as string)) {
            return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const {
            name,
            material,
            category,
            sellingPrice,
            minThreshold,
            color,
            dimensions,
            unit,
            // Lot initial (optionnel)
            initialQuantity,
            costPrice,
            receivedDate,
            batchNumber
        } = body;

        if (!name || !sellingPrice) {
            return NextResponse.json({ error: "Nom et Prix de vente sont requis" }, { status: 400 });
        }

        // Créer le produit + lot initial en une seule transaction atomique
        const newProduct = await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    name,
                    material: material || '',
                    category: category || 'Divers',
                    color: color || '',
                    dimensions: dimensions || '',
                    unit: unit || 'PIECE',
                    sellingPrice: Number(sellingPrice),
                    minThreshold: Number(minThreshold) || 5,
                    // Créer le lot initial si quantité fournie
                    ...(initialQuantity && Number(initialQuantity) > 0 && {
                        batches: {
                            create: {
                                batchNumber: batchNumber || `ROLL-${Date.now()}`,
                                quantity: Number(initialQuantity),
                                costPrice: Number(costPrice) || Number(sellingPrice) * 0.7,
                                receivedDate: receivedDate ? new Date(receivedDate) : new Date()
                            }
                        }
                    })
                },
                include: {
                    batches: true
                }
            });

            // Si un lot a été créé, on enregistre le mouvement de stock initial
            if (initialQuantity && Number(initialQuantity) > 0 && product.batches.length > 0) {
                await tx.stockMovement.create({
                    data: {
                        type: 'IN',
                        quantity: Number(initialQuantity),
                        productId: product.id,
                        batchId: product.batches[0].id,
                        userId: session.user.id as string,
                        reason: "Stock Initial"
                    }
                });
            }

            return product;
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error("Product POST Error:", error);
        return NextResponse.json({ error: "Erreur lors de la création du produit" }, { status: 500 });
    }
}
