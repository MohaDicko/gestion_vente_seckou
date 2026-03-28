import { StockService } from "./stock.service";
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
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
    processSale(saleData: any): Promise<{
        success: boolean;
        transactionId: any;
        details: {
            transactionId: string;
            results: any[];
        };
    }>;
    getVirtualStock(productId: string): Promise<number>;
}
