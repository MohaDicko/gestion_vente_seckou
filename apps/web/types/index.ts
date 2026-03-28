export type InventoryStatus = 'OK' | 'LOW' | 'RUPTURE';
export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface Product {
    id: string;
    name: string;
    material: string;
    category: string;
    stock: number;
    minThreshold: number;
    sellingPrice: number;
    inventoryStatus: InventoryStatus;
    status: 'ACTIF' | 'INACTIF';
    lastReceived: string | null;
    batchesCount: number;
    dimensions?: string;
    unit: string;
    color?: string;
}

export interface Batch {
    id: string;
    batchNumber: string;
    receivedDate: string;
    costPrice: number;
    quantity: number;
    productId: string;
}

export interface Transaction {
    id: string;
    type: 'SALE' | 'PURCHASE' | 'REFUND';
    amount: number;
    paymentMethod: 'CASH' | 'CARD' | 'INSURANCE' | 'MOBILE_MONEY';
    status: 'COMPLETED' | 'CANCELLED' | 'PENDING';
    createdAt: string;
}
