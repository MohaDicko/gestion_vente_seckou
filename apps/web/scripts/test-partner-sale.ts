import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const partnerId = "6534c525-2eca-43e2-8c8d-69944c0dde66"
    const productId = "a894c164-95d2-4839-b9e2-90974b5ce0fd"
    const userId = (await prisma.user.findFirst())?.id || "system"

    console.log(`🚀 Simulating partner sale for Product ID: ${productId} with Partner ID: ${partnerId}`)

    // 1. Get product price
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new Error("Product not found")
    const price = product.sellingPrice
    const quantity = 2
    const total = price * quantity
    const partnerAmount = Math.round(total * 0.7)
    const clientAmount = total - partnerAmount

    console.log(`💰 Total: ${total} F | Partner Share (70%): ${partnerAmount} F | Client Share: ${clientAmount} F`)

    // We'll call the logic directly since we don't want to spin up the whole Next.js server for a script
    // But better yet, let's just make a POST request if the server is running, or simulate the transaction logic.
    // Let's simulate the transaction logic to be closer to what route.ts does.

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Create Transaction
            const transaction = await tx.transaction.create({
                data: {
                    type: 'SALE',
                    amount: total,
                    paymentMethod: 'PARTNER',
                    status: 'COMPLETED',
                    userId: userId,
                    partnerId: partnerId,
                    partnerAmount: partnerAmount,
                    clientAmount: clientAmount
                }
            })

            // Find batches for the product
            const batches = await tx.batch.findMany({
                where: { productId, quantity: { gt: 0 } },
                orderBy: { receivedDate: 'asc' }
            })

            let remaining = quantity
            for (const batch of batches) {
                if (remaining <= 0) break
                const deduct = Math.min(batch.quantity, remaining)
                
                await tx.batch.update({
                    where: { id: batch.id },
                    data: { quantity: { decrement: deduct } }
                })

                await tx.stockMovement.create({
                    data: {
                        type: 'OUT',
                        quantity: -deduct,
                        reason: 'TEST_PARTNER_SALE',
                        productId,
                        batchId: batch.id,
                        userId,
                        transactionId: transaction.id
                    }
                })
                remaining -= deduct
            }

            if (remaining > 0) throw new Error("Stock insuffisant pendant la transaction")
            
            return transaction
        })

        console.log(`✅ Sale simulated successfully! Transaction ID: ${result.id}`)
        
        // Final State Check
        const updatedProduct = await prisma.batch.aggregate({
            where: { productId },
            _sum: { quantity: true }
        })
        console.log(`📦 New Stock for product: ${updatedProduct._sum.quantity}`)

    } catch (e) {
        console.error("❌ Sale simulation failed:", e)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
