import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testStep(name: string, fn: () => Promise<void>) {
    console.log(`🔍 Testing: ${name}...`)
    try {
        await fn()
        console.log(`✅ ${name}: SUCCESS`)
    } catch (e) {
        console.error(`❌ ${name}: FAILED`)
        console.error(e)
        throw e
    }
}

async function main() {
    console.log('🚀 --- DEBUT DU TEST COMPLET DE LA BASE DE DONNÉES --- 🚀\n')

    // 1. TEST UTILISATEURS
    await testStep('Gestion des Utilisateurs (RBAC)', async () => {
        const testEmail = `test-user-${Date.now()}@sekou.com`
        const user = await prisma.user.create({
            data: {
                name: "Test Admin",
                email: testEmail,
                password: "hushed_password",
                role: "ADMIN"
            }
        })
        const found = await prisma.user.findUnique({ where: { id: user.id } })
        if (!found || found.email !== testEmail) throw new Error("User mismatch")
        
        await prisma.user.update({
            where: { id: user.id },
            data: { name: "Test Admin Updated" }
        })
    })

    // 2. TEST PARTENAIRES & CLIENTS
    let partnerId = ""
    await testStep('Gestion des Partenaires & Clients', async () => {
        const partner = await prisma.partner.create({
            data: { name: `Test Partner ${Date.now()}`, percentage: 50 }
        })
        partnerId = partner.id

        const customer = await prisma.customer.create({
            data: { name: "Test Client", phone: `0000${Date.now()}`.slice(-8) }
        })
        if (!customer.id) throw new Error("Customer create failed")
    })

    // 3. TEST PRODUITS & LOTS (INVENTAIRE)
    let productId = ""
    let batchId = ""
    await testStep('Gestion Inventaire & Lots (FIFO)', async () => {
        const product = await prisma.product.create({
            data: {
                name: "Tissu Test",
                material: "Coton",
                category: "Test",
                minThreshold: 5,
                unit: "METRE",
                sellingPrice: 10000,
                batches: {
                    create: {
                        batchNumber: "LOT-TEST-001",
                        quantity: 100,
                        costPrice: 7000
                    }
                }
            },
            include: { batches: true }
        })
        productId = product.id
        batchId = product.batches[0].id
        if (product.batches[0].quantity !== 100) throw new Error("Initial stock mismatch")
    })

    // 4. TEST TRANSACTIONS & MOUVEMENTS (BUSINESS LOGIC)
    await testStep('Logique de Vente & Mouvement de Stock', async () => {
        const user = await prisma.user.findFirst()
        if (!user) throw new Error("Need at least one user")

        // Simulation d'une vente de 10m
        const total = 10 * 10000 // 100,000 F
        const partnerShare = 50000
        const clientShare = 50000

        const txResult = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    amount: total,
                    type: 'SALE',
                    paymentMethod: 'PARTNER',
                    partnerId: partnerId,
                    partnerAmount: partnerShare,
                    clientAmount: clientShare,
                    userId: user.id
                }
            })

            await tx.batch.update({
                where: { id: batchId },
                data: { quantity: { decrement: 10 } }
            })

            await tx.stockMovement.create({
                data: {
                    type: 'OUT',
                    quantity: -10,
                    productId: productId,
                    batchId: batchId,
                    userId: user.id,
                    transactionId: transaction.id,
                    reason: "Vente Test"
                }
            })

            return transaction
        })

        // Verification des effets de bord
        const updatedBatch = await prisma.batch.findUnique({ where: { id: batchId } })
        if (updatedBatch?.quantity !== 90) throw new Error("Stock deduction failed")

        const movement = await prisma.stockMovement.findFirst({ where: { transactionId: txResult.id } })
        if (!movement || movement.quantity !== -10) throw new Error("Stock movement record failed")
    })

    // 5. TEST NETTOYAGE (Optionnel, on garde pour verifier si besoin)
    console.log('\n✨ --- TESTS TERMINÉS AVEC SUCCÈS --- ✨')
}

main()
    .catch(e => {
        console.error('\n💥 TEST DATABASE ECHOUE 💥')
        process.exit(1)
    })
    .finally(async () => await prisma.$disconnect())
