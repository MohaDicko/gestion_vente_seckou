import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const partner = await prisma.partner.create({
        data: {
            name: "GIE Textile Mali",
            percentage: 70,
            status: "ACTIF",
            code: "GIE-001"
        }
    })
    console.log(`✅ Partner created: ${partner.name} (ID: ${partner.id})`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
