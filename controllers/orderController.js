const db = require('../config/database');

// Створення замовлення
exports.createOrder = (req, res) => {
  const { customer_name, customer_phone, pickup_time, comment, items } = req.body;

  const menuIds = items.map(i => i.menu_id);
  const placeholders = menuIds.map(() => '?').join(',');

  db.all(`SELECT id, price FROM menu WHERE id IN (${placeholders})`, menuIds, (err, menuRows) => {
    if (err) return res.status(500).json({ error: err.message });

    let totalPrice = 0;
    const priceMap = {};
    menuRows.forEach(row => { priceMap[row.id] = row.price; });

    items.forEach(item => {
      totalPrice += (priceMap[item.menu_id] || 0) * item.quantity;
    });

    const sqlOrder = `
      INSERT INTO orders (customer_name, customer_phone, pickup_time, comment, total_price) 
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sqlOrder, [customer_name, customer_phone, pickup_time, comment || '', totalPrice], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      const orderId = this.lastID;
      const stmt = db.prepare(`INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)`);

      items.forEach(item => {
        stmt.run(orderId, item.menu_id, item.quantity, priceMap[item.menu_id] || 0);
      });
      stmt.finalize();

      res.status(201).json({
        success: true,
        order_id: orderId,
        status: "NEW",
        total_price: totalPrice,
        message: "Замовлення успішно створено!"
      });
    });
  });
};

// Отримання списку замовлень (Дашборд бариста)
exports.getOrders = (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY id DESC`, [], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all(`
      SELECT order_items.*, menu.title 
      FROM order_items 
      JOIN menu ON order_items.menu_id = menu.id
    `, [], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });

      const result = orders.map(order => ({
        ...order,
        items: items.filter(i => i.order_id === order.id)
      }));

      res.json(result);
    });
  });
};

// Зміна статусу замовлення
exports.updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Статус обов'язковий" });

  db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, orderId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, order_id: orderId, new_status: status });
  });
};