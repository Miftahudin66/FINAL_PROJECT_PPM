import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('rentready.db');

export interface Item {
  id: number;
  name: string;
  category: string;
  price_per_day: number;
  status: 'available' | 'rented' | 'maintenance';
  description?: string;
  image_url?: string;
}

export interface Rental {
  id: number;
  item_id: number;
  customer_name: string;
  rental_date: string;
  return_date: string;
  actual_return_date: string | null;
  status: 'active' | 'returned' | 'late';
  total_cost: number;
}

export const initDatabase = () => {
  db.execSync(`
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price_per_day REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      description TEXT,
      image_url TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS rentals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      rental_date TEXT NOT NULL,
      return_date TEXT NOT NULL,
      actual_return_date TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      total_cost REAL DEFAULT 0,
      FOREIGN KEY (item_id) REFERENCES items (id)
    );
  `);

  // Migration for existing tables
  try { db.execSync('ALTER TABLE items ADD COLUMN description TEXT;'); } catch (e) { }
  try { db.execSync('ALTER TABLE items ADD COLUMN image_url TEXT;'); } catch (e) { }
  try { db.execSync('ALTER TABLE rentals ADD COLUMN total_cost REAL DEFAULT 0;'); } catch (e) { }
};

// Items CRUD
// Items CRUD
export const addItem = (name: string, category: string, price: number, description?: string, imageUrl?: string) => {
  db.runSync(
    'INSERT INTO items (name, category, price_per_day, status, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    name, category, price, 'available', description || '', imageUrl || ''
  );
};

export const getItems = (): Item[] => {
  return db.getAllSync('SELECT * FROM items');
};

export const updateItemStatus = (id: number, status: Item['status']) => {
  db.runSync('UPDATE items SET status = ? WHERE id = ?', status, id);
};

// Rentals CRUD
// Rentals CRUD
export const addRental = (itemId: number, customerName: string, rentalDate: string, returnDate: string, totalCost: number) => {
  db.runSync(
    'INSERT INTO rentals (item_id, customer_name, rental_date, return_date, status, total_cost) VALUES (?, ?, ?, ?, ?, ?)',
    itemId, customerName, rentalDate, returnDate, 'active', totalCost
  );
  updateItemStatus(itemId, 'rented');
};

export const returnRental = (rentalId: number, itemId: number, actualReturnDate: string, status: 'returned' | 'late') => {
  db.runSync(
    'UPDATE rentals SET actual_return_date = ?, status = ? WHERE id = ?',
    actualReturnDate, status, rentalId
  );
  updateItemStatus(itemId, 'available');
};

export const getRentals = (): Rental[] => {
  return db.getAllSync('SELECT * FROM rentals');
};

// Seed data helpful for testing
export const seedDatabase = () => {
  const items = getItems();
  if (items.length === 0) {
    addItem('Canon EOS R5', 'Camera', 500000, 'Professional mirrorless camera', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32');
    addItem('Sony A7III', 'Camera', 350000, 'Versatile full-frame camera', 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4');
    addItem('Tent 4 Person', 'Camping', 45000, 'Spacious family tent', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d');
    addItem('Sleeping Bag', 'Camping', 15000, 'Warm all-season bag', 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7');
  }
};

export const getDashboardStats = () => {
  const revenueResult = db.getAllSync<{ total: number }>('SELECT SUM(total_cost) as total FROM rentals');
  const activeResult = db.getAllSync<{ count: number }>('SELECT COUNT(*) as count FROM rentals WHERE status IN ("active", "late")');
  const lateResult = db.getAllSync<{ count: number }>('SELECT COUNT(*) as count FROM rentals WHERE status = "late"');

  // Simplistic weekly data (mock logic using randomness for demo visual matching if needed, or real GROUP BY)
  // For now, return what we asked for
  return {
    totalRevenue: revenueResult[0]?.total || 0,
    activeRentals: activeResult[0]?.count || 0,
    lateRentals: lateResult[0]?.count || 0
  };
};
