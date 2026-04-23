const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * @desc    Get all notifications for a user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ user: req.user._id }, { user: null }]
    }).sort('-createdAt').limit(50);

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a notification for all users (Admin)
 * @route   POST /api/notifications/broadcast
 * @access  Private/Admin
 */
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, image, type = 'offer' } = req.body;

    const notification = await Notification.create({
      title,
      message,
      image,
      type,
      user: null // null means broadcast to all
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  broadcastNotification,
  markAsRead
};
