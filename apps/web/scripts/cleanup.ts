import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 --- NETTOYAGE DES DONNÉES DE TEST --- 🧹\n')

    // On commence par supprimer les dépendances (le plus bas dans la hiérarchie)
    
    // 1. Supprimer les mouvements de stock liés aux tests
    const movements = await prisma.stockMovement.deleteMany({
        where: {
            OR: [
                { reason: { contains: "TEST" } },
                { reason: { contains: "Vente Test" } }
            ]
        }
    })
    console.log(`✅ Mouvements de stock supprimés : ${movements.count}`)

    // 2. Supprimer les transactions de test
    const transactions = await prisma.transaction.deleteMany({
        where: {
            OR: [
                { partner: { name: { contains: "Test" } } },
                { partner: { name: "GIE Textile Mali" } },
                { type: "SALE", amount: 30000 } // La vente de 2 rideaux à 15k
            ]
        }
    })
    console.log(`✅ Transactions supprimées : ${transactions.count}`)

    // 3. Supprimer les lots (batches) de test
    const deletedBatches = await prisma.batch.deleteMany({
        where: {
            OR: [
                { batchNumber: { contains: "TEST" } },
                { product: { name: "Tissu Test" } },
                { product: { name: "Rideau Occultant Gris" } }
            ]
        }
    })
    console.log(`✅ Lots (batches) supprimés : ${deletedBatches.count}`)

    // 4. Supprimer les produits de test
    const products = await prisma.product.deleteMany({
        where: {
            OR: [
                { name: "Tissu Test" },
                { name: "Rideau Occultant Gris" } // Produit utilisé lors de la simulation
            ]
        }
    })
    console.log(`✅ Produits supprimés : ${products.count}`)

    // 5. Supprimer les partenaires de test
    const partners = await prisma.partner.deleteMany({
        where: {
            OR: [
                { name: { contains: "Test" } },
                { name: "GIE Textile Mali" }
            ]
        }
    })
    console.log(`✅ Partenaires supprimés : ${partners.count}`)

    // 6. Supprimer les clients de test
    const customers = await prisma.customer.deleteMany({
        where: {
            OR: [
                { name: "Test Client" }
            ]
        }
    })
    console.log(`✅ Clients supprimés : ${customers.count}`)

    // 7. Supprimer les utilisateurs de test
    const users = await prisma.user.deleteMany({
        where: {
            OR: [
                { name: "Test Admin" },
                { email: { contains: "test-user-" } }
            ]
        }
    })
    console.log(`✅ Utilisateurs supprimés : ${users.count}`)

    console.log('\n✨ --- BASE DE DONNÉES NETTOYÉE ET PROPRE --- ✨')
}

main()
    .catch(e => {
        console.error('\n💥 ERREUR LORS DU NETTOYAGE 💥')
        console.error(e)
        process.exit(1)
    })
    .finally(async () => await prisma.$disconnect())
