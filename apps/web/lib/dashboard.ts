import { prisma } from "@/lib/prisma"
import { startOfDay, subDays, format } from "date-fns"

export async function getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesToday = await prisma.transaction.findMany({
        where: {
            type: 'SALE',
            createdAt: { gte: today },
            status: 'COMPLETED'
        }
    });

    const dailyRevenue = salesToday.reduce((sum, tx) => sum + Number(tx.amount), 0);

    const allProducts = await prisma.product.findMany({
        where: { status: 'ACTIF' },
        include: {
            batches: {
                where: { quantity: { gt: 0 } }
            }
        }
    });

    let totalStockValue = 0;
    let outOfStockCount = 0;

    allProducts.forEach((product) => {
        const productQty = product.batches.reduce((sum, b) => sum + b.quantity, 0);
        if (productQty <= 0) outOfStockCount++;
        totalStockValue += productQty * Number(product.sellingPrice);
    });

    const recentDeliveries = await prisma.batch.findMany({
        orderBy: {
            receivedDate: 'desc',
        },
        take: 5,
        include: {
            product: true
        }
    });

    return {
        revenueToday: dailyRevenue,
        stockValue: totalStockValue,
        stockCount: allProducts.length,
        outOfStockCount: outOfStockCount,
        recentDeliveries: recentDeliveries.map((b) => ({
            productName: b.product.name,
            batchNumber: b.batchNumber,
            receivedDate: b.receivedDate.toISOString(),
            quantity: b.quantity
        }))
    };
}

export async function getDashboardReports() {
    const stats = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const start = startOfDay(date);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const sales = await prisma.transaction.findMany({
            where: {
                type: 'SALE',
                createdAt: { gte: start, lte: end },
                status: 'COMPLETED'
            }
        });

        const amount = sales.reduce((sum, tx) => sum + Number(tx.amount), 0);

        stats.push({
            name: format(date, 'dd/MM'),
            ventes: amount,
        });
    }

    const todayStart = startOfDay(new Date());
    const paymentStats = await prisma.transaction.groupBy({
        by: ['paymentMethod'],
        where: {
            type: 'SALE',
            createdAt: { gte: todayStart },
            status: 'COMPLETED'
        },
        _sum: {
            amount: true
        }
    });

    const paymentMethodData = paymentStats.map(stat => ({
        name: stat.paymentMethod,
        value: Number(stat._sum.amount || 0)
    }));

    return {
        trends: stats,
        payments: paymentMethodData
    };
}
