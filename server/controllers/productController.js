import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      subtitle,
      origin = 'Ethiopia',
      region,
      altitude,
      varietal,
      process,
      harvest = '2025/2026 Crop',
      producer,
      roast = 'Medium',
      roastLevel = 2.5,
      notes,
      tastingNotes,
      body,
      acidity,
      badge = '',
      image,
      colorAccent = '#607d57',
      description,
      prices,
      inStock = true,
      featured = false,
      brewGuide,
    } = req.body;

    const baseSlug = (name || 'ethiopian-specialty-coffee')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const product = new Product({
      name,
      slug,
      subtitle: subtitle || `${process || 'Washed'} · Grade 1 Specialty`,
      origin,
      region: region || 'Ethiopian Highlands',
      altitude: altitude || '1,900 – 2,200m',
      varietal: varietal || 'Indigenous Ethiopian Heirloom',
      process: process || 'Washed',
      harvest,
      producer: producer || 'Smallholder Farmer Cooperative',
      roast,
      roastLevel: Number(roastLevel) || 2.5,
      notes: notes || 'Floral, Bergamot, Citrus',
      tastingNotes: Array.isArray(tastingNotes)
        ? tastingNotes
        : typeof tastingNotes === 'string'
        ? tastingNotes.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Floral', 'Citrus', 'Honey'],
      body: body || 'Silky & Balanced',
      acidity: acidity || 'Bright & Vibrant',
      badge,
      image: image || '/images/product-yirgacheffe.jpg',
      colorAccent,
      description:
        description ||
        'Directly sourced from high-altitude Ethiopian micro-lots, roasted with precision to elevate pristine sweetness and floral aromatic complexity.',
      prices: prices || {
        '250g': 650,
        '500g': 1200,
        '1kg': 2300,
      },
      inStock: inStock !== false,
      featured: !!featured,
      brewGuide: brewGuide || {
        preferredMethod: 'V60 Pour Over',
        dose: '16g to 250g water',
        waterTemp: '93°C (200°F)',
        grind: 'Medium-Fine',
        brewTime: '2m 45s',
        tastingTip: 'Allow cup to cool slightly for amplified fruity sweetness.',
      },
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message || 'Failed to create product' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const fields = [
      'name',
      'subtitle',
      'origin',
      'region',
      'altitude',
      'varietal',
      'process',
      'harvest',
      'producer',
      'roast',
      'roastLevel',
      'notes',
      'tastingNotes',
      'body',
      'acidity',
      'badge',
      'image',
      'colorAccent',
      'description',
      'prices',
      'inStock',
      'featured',
      'brewGuide',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'tastingNotes' && typeof req.body[field] === 'string') {
          product[field] = req.body[field]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          product[field] = req.body[field];
        }
      }
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message || 'Failed to update product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message || 'Failed to delete product' });
  }
};
