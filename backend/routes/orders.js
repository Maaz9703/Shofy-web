const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { createPaymentIntent } = require('../controllers/stripeController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/create-payment-intent', protect, createPaymentIntent);
router.get('/admin/all', protect, admin, getAllOrders);
router.route('/').get(protect, getMyOrders).post(protect, createOrder);
router
  .route('/:id')
  .get(protect, getOrder)
  .delete(protect, admin, deleteOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
