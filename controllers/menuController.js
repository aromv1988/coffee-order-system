const db = require('../config/database');

exports.getMenu = (req, res) => {
  const sql = `
    SELECT menu.id, menu.title, categories.name as category, menu.price, menu.description, menu.is_available 
    FROM menu 
    LEFT JOIN categories ON menu.category_id = categories.id
    WHERE menu.is_available = 1
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};