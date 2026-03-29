import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    console.log("🌱 Début du Seed Global...");

    // 1. Nettoyage
    await prisma.stockMovement.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.batch.deleteMany({});
    await prisma.product.deleteMany({});

    // 2. Produits Textiles de Luxe
    const products = [
        { name: "Rideau Voilage Blanc", material: "Polyester", category: "Rideaux", minThreshold: 10, price: 15000 },
        { name: "Tissu Velours Royal", material: "Velours", category: "Tissus", minThreshold: 5, price: 25000 },
        { name: "Drap Soie Premium", material: "Soie", category: "Linge de lit", minThreshold: 8, price: 45000 },
        { name: "Nappe Coton Brodé", material: "Coton", category: "Linge de table", minThreshold: 12, price: 12000 },
    ];

    const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) throw new Error("Admin not found. Run seed-admin first.");

    for (const p of products) {
        const product = await prisma.product.create({
            data: {
                name: p.name,
                material: p.material,
                category: p.category,
                minThreshold: p.minThreshold,
                sellingPrice: p.price,
            }
        });

        // 3. Lots pour chaque produit (un récent, un proche de péremption)
        await prisma.batch.createMany({
            data: [
                {
                    productId: product.id,
                    batchNumber: `${p.name.substring(0, 3).toUpperCase()}-24-001`,
                    quantity: 100,
                    costPrice: p.price * 0.6,
                    receivedDate: new Date('2024-01-01'),
                },
                {
                    productId: product.id,
                    batchNumber: `${p.name.substring(0, 3).toUpperCase()}-24-002`,
                    quantity: 5,
                    costPrice: p.price * 0.6,
                    receivedDate: new Date('2024-03-01'),
                }
            ]
        });

        const batches = await prisma.batch.findMany({ where: { productId: product.id } });

        for (const b of batches) {
            await prisma.stockMovement.create({
                data: {
                    productId: product.id,
                    batchId: b.id,
                    userId: user.id,
                    type: 'IN',
                    quantity: b.quantity,
                    reason: 'Stock initial'
                }
            });
        }
    }

    console.log("✅ Seed terminé avec succès !");
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
