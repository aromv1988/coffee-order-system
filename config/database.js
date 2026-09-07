const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../coffee_order.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Таблиця категорій
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  // 2. Таблиця меню
  db.run(`
    CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category_id INTEGER,
      price REAL NOT NULL,
      description TEXT,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  // 3. Таблиця замовлень
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      pickup_time TEXT NOT NULL,
      comment TEXT,
      status TEXT DEFAULT 'NEW',
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Таблиця елементів замовлення
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      menu_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (menu_id) REFERENCES menu (id)
    )
  `);

  // Початкове заповнення меню, якщо воно порожнє
  db.get("SELECT COUNT(*) as count FROM menu", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO categories (name) VALUES ('Кава'), ('Десерти')");
      const stmt = db.prepare("INSERT INTO menu (title, category_id, price, description) VALUES (?, ?, ?, ?)");
      stmt.run("Еспресо", 1, 45.00, "Міцний класичний напій");
      stmt.run("Капучино", 1, 65.00, "Еспресо зі збитим молоком");
      stmt.run("Лате", 1, 70.00, "Ніжний кавово-молочний напій");
      stmt.run("Круасан", 2, 55.00, "Свіжий масляний круасан");
      stmt.finalize();
      console.log("[DB] База даних успішно ініціалізована та заповнена меню.");
    }
  });
});

module.exports = db;