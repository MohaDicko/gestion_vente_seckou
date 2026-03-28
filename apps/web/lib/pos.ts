import { prisma } from "@/lib/prisma"

export async function getPOSProducts() {
    const products = await prisma.product.findMany({
        where: { status: 'ACTIF' },
        orderBy: { name: 'asc' },
        include: {
            batches: {
                where: { quantity: { gt: 0 } }
            }
        }
    });

    return products.map((p) => {
        const totalStock = p.batches.reduce((sum, batch) => sum + batch.quantity, 0);
        return {
            id: p.id,
            name: p.name,
            material: p.material || "",
            price: Number(p.sellingPrice),
            stock: totalStock,
            dimensions: p.dimensions,
            unit: p.unit
        };
    });
}

export async function getPOSInsurances() {
    return await prisma.insurance.findMany({
        where: { status: 'ACTIF' },
        orderBy: { name: 'asc' }
    });
}
