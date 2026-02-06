export interface Item {
    id: string; // UUID
    name: string;
    category: string;
    pricePerDay: number;
    pricePerHour?: number;
    stock: number;
    status: 'available' | 'rented' | 'maintenance';
    description?: string;
    imageUrl?: string;
}

export interface Rental {
    id: string; // UUID
    itemId: string;
    itemName: string;
    userId: string; // Staff/Admin who processed it
    customerName: string;
    startDate: string; // ISO Date
    endDate: string;   // ISO Date
    totalCost: number;
    quantity: number;
    duration: number; // e.g., 3
    timeUnit: 'day' | 'hour';
    status: 'active' | 'completed' | 'overdue';
    synced: 0 | 1; // SQLite boolean
}

export interface User {
    uid: string;
    email: string;
    role: 'admin' | 'staff';
}

export interface SyncQueueItem {
    id: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    table: 'items' | 'rentals';
    data: string; // JSON string support
    timestamp: number;
}
