import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CustomerSchema = z.object({
    name: z.string().min(1, 'Nom requis'),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    address: z.string().optional().nullable(),
    category: z.enum(['DÉTAILLANT', 'GROSSISTE', 'FIDÈLE']).default('DÉTAILLANT'),
});

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

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
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const body = await req.json();
        const validation = CustomerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Données invalides', details: validation.error.format() }, { status: 400 });
        }

        const { name, phone, email, address, category } = validation.data;

        const customer = await prisma.customer.create({
            data: { name, phone: phone || null, email: email || null, address: address || null, category, status: 'ACTIF' }
        });
        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error("Customer Create Error:", error);
        return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
    }
}
