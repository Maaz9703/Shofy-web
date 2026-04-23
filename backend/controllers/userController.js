const User = require('../models/User');

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard stats (Admin)
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getStats = async (req, res, next) => {
  try {
    const Order = require('../models/Order');

    const [totalUsers, totalOrders, ordersResult] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = ordersResult[0]?.totalRevenue || 0;
    const completedOrders = ordersResult[0]?.count || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        completedOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (Admin)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin', 'shopkeeper'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getStats, updateUserRole };

