import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // 1. Calcul de la valeur totale du stock (Prix d'achat)
        const batches = await prisma.batch.findMany({
            where: { quantity: { gt: 0 } },
            select: {
                quantity: true,
                costPrice: true,
                receivedDate: true,
                product: {
                    select: {
                        name: true,
                        category: true,
                        minThreshold: true
                    }
                }
            }
        });

        const totalValue = batches.reduce((acc, b) => acc + (b.quantity * Number(b.costPrice)), 0);

        // 2. Produits en alerte (en dessous du seuil mini)
        const products = await prisma.product.findMany({
            include: {
                batches: {
                    where: { quantity: { gt: 0 } }
                }
            }
        });

        const lowStockProducts = products.map(p => {
            const currentQty = p.batches.reduce((acc, b) => acc + b.quantity, 0);
            return {
                id: p.id,
                name: p.name,
                currentQty,
                minThreshold: p.minThreshold,
                isLow: currentQty < p.minThreshold
            };
        }).filter(p => p.isLow);

        // 3. Anciens lots (Ancienneté du stock)
        const oldBatches = batches
            .sort((a, b) => a.receivedDate.getTime() - b.receivedDate.getTime())
            .slice(0, 5) // Top 5 des plus vieux lots
            .map(b => ({
                product: b.product.name,
                qty: b.quantity,
                receivedDate: b.receivedDate,
                ageInDays: Math.floor((new Date().getTime() - b.receivedDate.getTime()) / (1000 * 3600 * 24))
            }));

        return NextResponse.json({
            summary: {
                totalStockValue: totalValue,
                itemCount: batches.length,
                lowStockCount: lowStockProducts.length,
                oldestBatchCount: oldBatches.length
            },
            lowStockProducts,
            oldBatches
        });

    } catch (error) {
        console.error("Report API Error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
