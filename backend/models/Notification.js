const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: If null, it's for everyone
    type: { type: String, enum: ['offer', 'order', 'general'], default: 'general' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    image: { type: String },
    link: { type: String }, // Can link to a specific product or category
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
