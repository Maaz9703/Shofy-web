const Product = require('../models/Product');
const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    let query = {};

    if (search) {
      // Use regex for partial, case-insensitive matching
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    if (category) {
      // Exact match to leverage category index
      query.category = category;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(parsedLimit).lean(),
      Product.countDocuments(query)
    ]);

    res.json({ 
      success: true, 
      count: products.length, 
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parsedLimit),
      data: products 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get categories
 * @route   GET /api/products/categories/list
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Import products from CSV
 * @route   POST /api/products/import
 * @access  Private/Admin
 */
const importProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => {
        // Basic normalization: trim whitespace and handle keys case-insensitively if needed
        // For simplicity, we expect headers to match exactly (lower case typically)
        const product = {
          title: data.title || data.Title,
          description: data.description || data.Description,
          price: parseFloat(data.price || data.Price),
          stock: parseInt(data.stock || data.Stock, 10),
          category: data.category || data.Category,
          image: data.image || data.Image || 'https://via.placeholder.com/300',
        };

        // Push only if required fields are present
        if (product.title && product.description && !isNaN(product.price) && product.category) {
          results.push(product);
        }
      })
      .on('end', async () => {
        try {
          if (results.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid products found in CSV' });
          }

          const products = await Product.insertMany(results);
          res.status(201).json({
            success: true,
            count: products.length,
            message: `Successfully imported ${products.length} products`,
          });
        } catch (error) {
          next(error);
        }
      })
      .on('error', (error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  importProducts,
};
