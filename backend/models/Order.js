const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  color: String,
  flavor: String,
  note: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      required: true,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'Pending - Cash on Delivery',
        'Pending',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled',
      ],
      default: 'Pending',
    },
    statusHistory: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
    paymentIntentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Add indexes for performance optimization
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Set status for COD orders
orderSchema.pre('save', function (next) {
  if (this.isNew && this.paymentMethod === 'COD') {
    this.status = 'Pending - Cash on Delivery';
    this.statusHistory.push({ status: this.status, note: 'Order placed with COD' });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
