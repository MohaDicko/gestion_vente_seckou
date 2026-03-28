import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                batches: {
                    where: { quantity: { gt: 0 } },
                    orderBy: { receivedDate: 'asc' }
                }
            }
        });

        const inventory = products.map((product: any) => {
            const totalQty = product.batches.reduce((sum: number, b: any) => sum + b.quantity, 0);
            const lastReceived = product.batches.length > 0 ? product.batches[0].receivedDate : null;

            return {
                id: product.id,
                name: product.name,
                material: product.material,
                category: product.category,
                totalStock: totalQty,
                minThreshold: product.minThreshold,
                sellingPrice: Number(product.sellingPrice),
                lastReceived: lastReceived,
                status: totalQty <= 0 ? "Rupture" : totalQty <= product.minThreshold ? "Alerte" : "OK"
            };
        });

        return NextResponse.json(inventory);
    } catch (error) {
        console.error("Inventory Fetch Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
