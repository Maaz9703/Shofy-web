const express = require('express');
const router = express.Router();
const { getUsers, getStats, updateUserRole } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', protect, admin, getUsers);
router.get('/stats', protect, admin, getStats);
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;
