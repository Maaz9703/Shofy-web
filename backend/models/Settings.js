const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Shofy' },
    storeDescription: { type: String, default: 'Your trusted e-commerce platform' },
    adminPanelName: { type: String, default: 'Shofy Admin' },
    webAppName: { type: String, default: 'Shofy Web' },
    mobileAppName: { type: String, default: 'Shofy Mobile' },
    promoBannerText: { type: String, default: 'Welcome to our store!' },
    showPromoBanner: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    disableReviews: { type: Boolean, default: false },
    enableEmailNotifications: { type: Boolean, default: true },
    notifications: {
      newOrder: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      dailyReport: { type: Boolean, default: false },
    },
    dailyOffer: {
      title: { type: String, default: '' },
      message: { type: String, default: '' },
      image: { type: String, default: '' },
      isActive: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
