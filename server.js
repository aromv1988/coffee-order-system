const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Обслуговування статичних файлів Front-end з папки public
app.use(express.static('public'));

// Підключення REST API роутів
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
  console.log(`[Server] Back-end сервер «CoffeeOrder» запущено на http://localhost:${PORT}`);
});