import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Item, Rental, SyncQueueItem } from '../types';

// --- WEB MOCK STORAGE ---
// Global variables to hold data in memory when running on Web
let webItems: Item[] = [];
let webRentals: Rental[] = [];

// --- NATIVE DATABASE ---
// Web fallback or null
// On web, we provide a mock object so the app doesn't crash on boot
const db: any = Platform.OS === 'web'
    ? {
        execSync: () => { },
        runSync: () => { },
        getAllSync: () => [],
    }
    : SQLite.openDatabaseSync('rentready.db');

export const initDatabase = () => {
    if (Platform.OS === 'web') {
        console.warn("SQLite is not supported on web. Using In-Memory Mock implementation.");
        // Optional: Add some dummy data for web demo
        if (webItems.length === 0) {
            webItems.push({
                id: 'demo-1',
                name: 'Canon EOS R5',
                category: 'Camera',
                pricePerDay: 50,
                pricePerHour: 5,
                stock: 5,
                status: 'available',
                description: 'High resolution camera for professional photography',
                imageUrl: 'https://placehold.co/400'
            });
        }
        return;
    }

    try {
        db.execSync(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        pricePerDay REAL,
        pricePerHour REAL DEFAULT 0,
        stock INTEGER DEFAULT 1,
        status TEXT,
        description TEXT,
        imageUrl TEXT
      );
      CREATE TABLE IF NOT EXISTS rentals (
        id TEXT PRIMARY KEY,
        itemId TEXT,
        itemName TEXT,
        userId TEXT,
        customerName TEXT,
        startDate TEXT,
        endDate TEXT,
        totalCost REAL,
        quantity INTEGER DEFAULT 1,
        duration INTEGER,
        timeUnit TEXT,
        status TEXT,
        synced INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        table_name TEXT,
        data TEXT,
        timestamp INTEGER
      );
    `);

        // Migrations for existing tables (safe add if missing)
        try { db.execSync('ALTER TABLE items ADD COLUMN description TEXT;'); } catch (e) { }
        try { db.execSync('ALTER TABLE items ADD COLUMN imageUrl TEXT;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals ADD COLUMN totalCost REAL;'); } catch (e) { }

        // Migrations for Schema Unification (snake_case -> camelCase) from legacy DatabaseService
        try { db.execSync('ALTER TABLE items RENAME COLUMN price_per_day TO pricePerDay;'); } catch (e) { }
        // rentals table rename
        try { db.execSync('ALTER TABLE rentals RENAME COLUMN item_id TO itemId;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals RENAME COLUMN customer_name TO customerName;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals RENAME COLUMN rental_date TO startDate;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals RENAME COLUMN return_date TO endDate;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals RENAME COLUMN total_cost TO totalCost;'); } catch (e) { }

        // Migrations for missing columns in legacy rentals
        try { db.execSync('ALTER TABLE rentals ADD COLUMN itemName TEXT;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals ADD COLUMN userId TEXT;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals ADD COLUMN synced INTEGER DEFAULT 0;'); } catch (e) { }


        // Simplified Logic Migrations
        try { db.execSync('ALTER TABLE items ADD COLUMN stock INTEGER DEFAULT 1;'); } catch (e) { }
        try { db.execSync('ALTER TABLE items ADD COLUMN pricePerHour REAL DEFAULT 0;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals ADD COLUMN quantity INTEGER DEFAULT 1;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals ADD COLUMN duration INTEGER;'); } catch (e) { }
        try { db.execSync('ALTER TABLE rentals ADD COLUMN timeUnit TEXT;'); } catch (e) { }

        // Data Backfill: Populate itemName for legacy rentals that have it null
        try { db.execSync('UPDATE rentals SET itemName = (SELECT name FROM items WHERE items.id = rentals.itemId) WHERE itemName IS NULL;'); } catch (e) { }

    } catch (e) {
        console.error("Failed to init database", e);
    }
};

// --- Items CRUD ---
export const addItem = (item: Item) => {
    if (Platform.OS === 'web') {
        webItems.push(item);
        return;
    }

    db.runSync(
        'INSERT INTO items (id, name, category, pricePerDay, pricePerHour, stock, status, description, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.name, item.category, item.pricePerDay, item.pricePerHour || 0, item.stock || 1, item.status, item.description, item.imageUrl || '']
    );
    addToSyncQueue('CREATE', 'items', item);
};

export const updateItem = (item: Item) => {
    if (Platform.OS === 'web') {
        const index = webItems.findIndex(i => i.id === item.id);
        if (index !== -1) webItems[index] = item;
        return;
    }

    db.runSync(
        'UPDATE items SET name = ?, category = ?, pricePerDay = ?, pricePerHour = ?, stock = ?, status = ?, description = ?, imageUrl = ? WHERE id = ?',
        [item.name, item.category, item.pricePerDay, item.pricePerHour || 0, item.stock || 1, item.status, item.description || '', item.imageUrl || '', item.id]
    );
    addToSyncQueue('UPDATE', 'items', item);
};

export const getItems = (): Item[] => {
    if (Platform.OS === 'web') return [...webItems];
    return db.getAllSync('SELECT * FROM items');
};

export const getCategories = (): string[] => {
    if (Platform.OS === 'web') {
        const cats = new Set(webItems.map(i => i.category));
        return Array.from(cats);
    }
    const result = db.getAllSync('SELECT DISTINCT category FROM items WHERE category IS NOT NULL');
    // @ts-ignore
    return result.map(r => r.category);
};

export const updateItemStatus = (id: string, status: 'available' | 'rented' | 'maintenance') => {
    if (Platform.OS === 'web') {
        const idx = webItems.findIndex(i => i.id === id);
        if (idx >= 0) {
            webItems[idx].status = status;
        }
        return;
    }

    db.runSync('UPDATE items SET status = ? WHERE id = ?', [status, id]);
    addToSyncQueue('UPDATE', 'items', { id, status });
};

// --- Rentals CRUD ---
export const addRental = (rental: Rental) => {
    if (Platform.OS === 'web') {
        webRentals.push(rental);
        // updateItemStatus(rental.itemId, 'rented'); // Simplified logic doesn't lock status
        return;
    }

    db.runSync(
        'INSERT INTO rentals (id, itemId, itemName, userId, customerName, startDate, endDate, totalCost, quantity, duration, timeUnit, status, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [rental.id, rental.itemId, rental.itemName, rental.userId, rental.customerName, rental.startDate, rental.endDate, rental.totalCost, rental.quantity, rental.duration, rental.timeUnit, rental.status, 0]
    );
    // updateItemStatus(rental.itemId, 'rented'); // Simplified logic doesn't lock status
    addToSyncQueue('CREATE', 'rentals', rental);
};

export const returnRental = (rentalId: string, itemId: string) => {
    if (Platform.OS === 'web') {
        const rIdx = webRentals.findIndex(r => r.id === rentalId);
        if (rIdx >= 0) webRentals[rIdx].status = 'completed';

        // const iIdx = webItems.findIndex(i => i.id === itemId);
        // if (iIdx >= 0) webItems[iIdx].status = 'available';
        return;
    }

    db.runSync('UPDATE rentals SET status = ? WHERE id = ?', ['completed', rentalId]);
    // updateItemStatus(itemId, 'available');
    // Note: In real sync, we should queue 'UPDATE' rental too
    addToSyncQueue('UPDATE', 'rentals', { id: rentalId, status: 'completed' });
};

export const getRentals = (): Rental[] => {
    if (Platform.OS === 'web') return [...webRentals];
    return db.getAllSync('SELECT * FROM rentals');
};

export const seedDatabase = () => {
    if (Platform.OS === 'web') return;
    const items = getItems();
    if (items.length === 0) {
        db.runSync(`INSERT INTO items (id, name, category, pricePerDay, pricePerHour, stock, status, description, imageUrl) VALUES 
            ('seed-1', 'Canon EOS R5', 'Camera', 500000, 50000, 5, 'available', 'Professional mirrorless camera', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'),
            ('seed-2', 'Sony A7III', 'Camera', 350000, 35000, 5, 'available', 'Versatile full-frame camera', 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4'),
            ('seed-3', 'Tent 4 Person', 'Camping', 45000, 10000, 10, 'available', 'Spacious family tent', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d'),
            ('seed-4', 'Sleeping Bag', 'Camping', 15000, 5000, 20, 'available', 'Warm all-season bag', 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7');`
        );
    }
};

// --- Sync Queue ---
const addToSyncQueue = (action: 'CREATE' | 'UPDATE' | 'DELETE', tableName: 'items' | 'rentals', data: any) => {
    if (Platform.OS === 'web') return;
    db.runSync(
        'INSERT INTO sync_queue (action, table_name, data, timestamp) VALUES (?, ?, ?, ?)',
        [action, tableName, JSON.stringify(data), Date.now()]
    );
};

export const getSyncQueue = (): SyncQueueItem[] => {
    if (Platform.OS === 'web') return [];
    // @ts-ignore
    return db.getAllSync('SELECT * FROM sync_queue');
};


export const clearSyncQueueItem = (id: number) => {
    if (Platform.OS === 'web') return;
    db.runSync('DELETE FROM sync_queue WHERE id = ?', [id]);
};

export const getDashboardStats = () => {
    if (Platform.OS === 'web') {
        return {
            totalRevenue: webRentals.reduce((acc, r) => acc + (r.totalCost || 0), 0),
            activeRentals: webRentals.filter(r => ['active', 'overdue'].includes(r.status)).length,
            lateRentals: webRentals.filter(r => r.status === 'overdue').length
        };
    }

    const revenueResult = db.getAllSync('SELECT SUM(totalCost) as total FROM rentals');
    const activeResult = db.getAllSync('SELECT COUNT(*) as count FROM rentals WHERE status IN ("active", "overdue")');
    const lateResult = db.getAllSync('SELECT COUNT(*) as count FROM rentals WHERE status = "overdue"');

    return {
        // @ts-ignore
        totalRevenue: revenueResult[0]?.total || 0,
        // @ts-ignore
        activeRentals: activeResult[0]?.count || 0,
        // @ts-ignore
        lateRentals: lateResult[0]?.count || 0
    };
};
