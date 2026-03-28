export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    CASHIER: 'CASHIER'
} as const;

export type UserRole = keyof typeof ROLES;

export const CATEGORIES = [
    "Rideaux",
    "Draps",
    "Coussins",
    "Tissus",
    "Accessoires",
    "Autres"
];

export const UNITS = [
    { label: "Mètre", value: "METRE" },
    { label: "Pièce", value: "PIECE" },
    { label: "Rouleau", value: "ROLL" }
];
