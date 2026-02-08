const Product = require('../models/Product');
const { extractFrames } = require('../services/frameExtractor');
const fs = require('fs');
const path = require('path');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a video file' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      videoPath: req.file.path,
      processingStatus: 'processing',
      user: req.user._id,
    });

    // Extract frames asynchronously
    const frameCount = parseInt(process.env.FRAMES_PER_VIDEO) || 72;

    extractFrames(req.file.path, product._id.toString(), frameCount)
      .then(async (frames) => {
        product.frames = frames;
        product.frameCount = frames.length;
        product.thumbnail = frames[0]?.path || '';
        product.processingStatus = 'completed';
        await product.save();
        console.log(`Frames extracted for product ${product._id}: ${frames.length} frames`);
      })
      .catch(async (error) => {
        console.error(`Frame extraction failed for ${product._id}:`, error.message);
        product.processingStatus = 'failed';
        await product.save();
      });

    res.status(201).json({
      message: 'Product created. Video is being processed.',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .populate('user', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('user', 'name avatar');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const allowedUpdates = ['name', 'description', 'price', 'category', 'brand', 'hotspots'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Clean up files
    const framesDir = path.join(__dirname, '../uploads/frames', product._id.toString());
    if (fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true });
    }
    if (product.videoPath && fs.existsSync(product.videoPath)) {
      fs.unlinkSync(product.videoPath);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProcessingStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('processingStatus frameCount');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({
      status: product.processingStatus,
      frameCount: product.frameCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
