// Middleware для валідації вхідних даних замовлення
const validateOrder = (req, res, next) => {
  const { customer_name, customer_phone, pickup_time, items } = req.body;

  if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
    return res.status(400).json({ error: "Будь ласка, вкажіть коректне ім'я (мінімум 2 символи)." });
  }

  if (!customer_phone || !/^\+?[0-9]{10,12}$/.test(customer_phone.replace(/\s+/g, ''))) {
    return res.status(400).json({ error: "Некоректний номер телефону." });
  }

  if (!pickup_time) {
    return res.status(400).json({ error: "Вкажіть час самовивозу." });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Кошик замовлення не може бути порожнім." });
  }

  next(); // Передаємо управління контролеру
};

module.exports = { validateOrder };