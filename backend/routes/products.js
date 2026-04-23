const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  importProducts,
} = require('../controllers/productController');
const { protect, optionalProtect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/multer');

router.get('/categories/list', getCategories);
router.post('/import', protect, admin, upload.single('csv'), importProducts);
router.route('/').get(optionalProtect, getProducts).post(protect, admin, createProduct);
router.route('/:id').get(optionalProtect, getProduct).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

module.exports = router;
