const express = require('express');
const {
  getNotifications,
  broadcastNotification,
  markAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/broadcast', admin, broadcastNotification);

module.exports = router;
