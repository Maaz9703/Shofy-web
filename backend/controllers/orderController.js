const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    let total = 0;
    const orderItems = [];

    // Group quantities for discounts
    const productQtyMap = {};
    for (const item of items) {
      productQtyMap[item.product] = (productQtyMap[item.product] || 0) + item.quantity;
    }

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`,
        });
      }

      let applicableDiscount = 0;
      const totalQtyForProduct = productQtyMap[item.product];
      if (product.quantityDiscounts && product.quantityDiscounts.length > 0) {
        const applicable = product.quantityDiscounts
          .filter(t => totalQtyForProduct >= t.minQty)
          .sort((a, b) => b.minQty - a.minQty)[0];
        if (applicable) applicableDiscount = applicable.discountPercent;
      }
      const unitPrice = product.price * (1 - applicableDiscount / 100);

      const itemTotal = unitPrice * item.quantity;
      total += itemTotal;

      orderItems.push({
        product: product._id,
        title: product.title,
        quantity: item.quantity,
        price: unitPrice,
        color: item.color,
        flavor: item.flavor,
        note: item.note,
      });
    }

    // Add shipping charges for Cash on Delivery
    const shippingCharges = paymentMethod === 'COD' ? 100 : 0;
    const finalTotal = total + shippingCharges;

    const status =
      paymentMethod === 'COD' ? 'Pending - Cash on Delivery' : 'Pending';

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      total: finalTotal,
      shippingCharges,
      status,
      statusHistory: [{ status, note: 'Order placed' }],
    });

    // Reduce stock - inventory auto update
    for (const item of orderItems) {
      const updateQuery = { $inc: { stock: -item.quantity } };
      
      // If a flavor was ordered, decrease its specific stock too
      if (item.flavor) {
        await Product.findOneAndUpdate(
          { _id: item.product, 'flavors.name': item.flavor },
          { $inc: { stock: -item.quantity, 'flavors.$.stock': -item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, updateQuery);
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'title image');

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user orders
 * @route   GET /api/orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'title image')
      .sort('-createdAt');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title image price')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders/admin/all
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'title image')
      .sort('-createdAt');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending - Cash on Delivery', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({ status, note: `Status updated to ${status}` });
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete order (Admin)
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await order.deleteOne();

    res.json({ success: true, message: 'Order removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
