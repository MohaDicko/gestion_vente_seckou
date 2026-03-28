import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error("Customers Fetch Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const customer = await prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
                category: data.category || "DÉTAILLANT",
                status: "ACTIF"
            }
        });
        return NextResponse.json(customer);
    } catch (error) {
        console.error("Customer Create Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
