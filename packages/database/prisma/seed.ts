import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding Sekou Draperie database (Adapted Logic)...')

    // 1. Initialisation de l'Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin'

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    })

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10)
        await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Sekou Admin',
                password: hashedPassword,
                role: 'ADMIN',
            },
        })
        console.log(`✅ Admin Sekou créé: ${adminEmail}`)
    }

    // 2. Catalogue de Produits (Rideaux & Draps)
    const productCount = await prisma.product.count()
    if (productCount === 0) {
        const catalog = [
            {
                name: "Rideau Occultant Gris",
                material: "Polyester 100%",
                category: "Rideaux",
                sellingPrice: 15000,
                dimensions: "140x260 cm",
                unit: "PIECE",
                initialQty: 20
            },
            {
                name: "Drap Satin Blanc",
                material: "Satin de Coton",
                category: "Draps",
                sellingPrice: 25000,
                dimensions: "240x260 cm (King)",
                unit: "PIECE",
                initialQty: 15
            },
            {
                name: "Tissu Voilage au Mètre",
                material: "Dentelle Fine",
                category: "Tissus",
                sellingPrice: 4500,
                dimensions: "Largeur 280cm",
                unit: "METRE",
                initialQty: 100
            }
        ]

        for (const item of catalog) {
            const product = await prisma.product.create({
                data: {
                    name: item.name,
                    material: item.material,
                    category: item.category,
                    dimensions: item.dimensions,
                    unit: item.unit,
                    minThreshold: item.unit === 'METRE' ? 20 : 5,
                    sellingPrice: item.sellingPrice,
                    batches: {
                        create: {
                            batchNumber: `ROLL-${Date.now()}-${Math.floor(Math.random()*100)}`,
                            quantity: item.initialQty,
                            costPrice: item.sellingPrice * 0.6,
                        }
                    }
                }
            })
        }
        console.log(`✅ Catalogue initial créé (${catalog.length} produits avec stock).`)
    }

    console.log('✨ Seeding terminé avec succès.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
