const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middlewares/validator');

router.get('/', orderController.getOrders);
router.post('/', validateOrder, orderController.createOrder); // З використанням middleware валідації!
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;