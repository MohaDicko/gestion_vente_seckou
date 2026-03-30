import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const seedHandler = async (req: Request) => {
    // 🛡️ SÉCURITÉ : Token requis même en Dev
    const token = req.headers.get('x-seed-token');
    if (!process.env.SEED_TOKEN || token !== process.env.SEED_TOKEN) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("🧹 Nettoyage de la base de données...");
        // Supprimer toutes les données existantes (Order matters because of FK constraints)
        await prisma.stockMovement.deleteMany({});
        await prisma.transaction.deleteMany({});
        await prisma.auditLog.deleteMany({});
        await prisma.batch.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.user.deleteMany({});

        console.log("👤 Création de l'Administrateur...");

        // Utiliser les variables d'environnement si disponibles, sinon défaut DEV uniquement
        const adminEmail = process.env.ADMIN_EMAIL || "admin@sekou-draperie.com";
        const adminPass = process.env.ADMIN_PASSWORD || "admin123";

        const hashedPassword = await bcrypt.hash(adminPass, 10);

        const adminUser = await prisma.user.create({
            data: {
                name: "Sekou Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "ADMIN"
            }
        });

        console.log(`✅ Admin créé: ${adminUser.email} (ID: ${adminUser.id})`);

        const catalog = [
            {
                name: "Rideau Occultant Gris",
                material: "Polyester 100%",
                category: "Rideaux",
                sellingPrice: 15000,
                costPrice: 8500,
                minThreshold: 10,
                batches: [
                    { num: "LOT-R-01", qty: 20, rec: "2026-01-15" }
                ]
            },
            {
                name: "Drap Satin Blanc 2 Personnes",
                material: "Satin de Coton",
                category: "Draps",
                sellingPrice: 25000,
                costPrice: 15000,
                minThreshold: 5,
                batches: [
                    { num: "LOT-D-01", qty: 15, rec: "2026-02-10" }
                ]
            },
            {
                name: "Coussin Velours Bleu",
                material: "Velours",
                category: "Accessoires",
                sellingPrice: 5000,
                costPrice: 2500,
                minThreshold: 20,
                batches: [
                    { num: "LOT-C-01", qty: 50, rec: "2026-03-01" }
                ]
            },
            {
                name: "Rideau Voilage Dentelle",
                material: "Dentelle Blanche",
                category: "Rideaux",
                sellingPrice: 8000,
                costPrice: 4000,
                minThreshold: 15,
                batches: [
                    { num: "LOT-V-01", qty: 30, rec: "2026-03-20" }
                ]
            }
        ];

        for (const item of catalog) {
            const product = await prisma.product.create({
                data: {
                    name: item.name,
                    material: item.material,
                    category: item.category,
                    minThreshold: item.minThreshold,
                    sellingPrice: item.sellingPrice,
                }
            });

            for (const batchData of item.batches) {
                const batch = await prisma.batch.create({
                    data: {
                        productId: product.id,
                        batchNumber: batchData.num,
                        quantity: batchData.qty,
                        costPrice: item.costPrice,
                        receivedDate: new Date(batchData.rec)
                    }
                });

                await prisma.stockMovement.create({
                    data: {
                        type: "IN",
                        quantity: batchData.qty,
                        reason: "Initial Seed",
                        userId: adminUser.id,
                        productId: product.id,
                        batchId: batch.id
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `${catalog.length} produits insérés. Admin: ${adminUser.email}`
        });

    } catch (error) {
        console.error("Erreur Seed:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
};

// 🛡️ SÉCURITÉ : Désactivé en Production ET en Preview Vercel
// Un attaquant ne peut pas réinitialiser la base via une URL preview
const isVercelDeployed = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';

export const GET = isVercelDeployed
    ? async () => new NextResponse(null, { status: 404 })
    : seedHandler;
