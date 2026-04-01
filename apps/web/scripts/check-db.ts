import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const usersCount = await prisma.user.count()
    const productsCount = await prisma.product.count()
    const partnersCount = await prisma.partner.count()

    console.log('--- DATABASE STATE ---')
    console.log(`Users: ${usersCount}`)
    console.log(`Products: ${productsCount}`)
    console.log(`Partners: ${partnersCount}`)

    if (partnersCount > 0) {
        const p = await prisma.partner.findFirst()
        console.log(`Example Partner: ${p?.name} (ID: ${p?.id}, ${p?.percentage}%)`)
    }

    if (productsCount > 0) {
        const pr = await prisma.product.findFirst({
            include: { batches: true }
        })
        const stock = pr?.batches.reduce((s, b) => s + b.quantity, 0) || 0
        console.log(`Example Product: ${pr?.name} (ID: ${pr?.id}) - Stock: ${stock}`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
