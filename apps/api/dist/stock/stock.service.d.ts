import { PrismaService } from "../frameworks/data-services/prisma/prisma.service";
interface SaleItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}
export declare class StockService {
    private prisma;
    constructor(prisma: PrismaService);
    processSale(items: SaleItemDto[], userId: string, paymentMethod: string): Promise<{
        transactionId: string;
        results: any[];
    }>;
    getVirtualStock(productId: string): Promise<number>;
    findAll(): Promise<({
        batches: {
            id: string;
            batchNumber: string;
            receivedDate: Date;
            costPrice: number;
            quantity: number;
            productId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        material: string;
        name: string;
        category: string;
        color: string | null;
        dimensions: string | null;
        unit: string;
        minThreshold: number;
        sellingPrice: number;
        status: string;
        codeMatrix: string | null;
        barCode: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
export {};
