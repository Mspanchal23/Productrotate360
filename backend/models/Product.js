const mongoose = require('mongoose');

const hotspotSchema = new mongoose.Schema({
  frameIndex: { type: Number, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  label: { type: String, required: true },
  description: { type: String, default: '' },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['electronics', 'furniture', 'fashion', 'automotive', 'sports', 'other'],
    },
    brand: {
      type: String,
      default: '',
    },
    videoPath: {
      type: String,
      default: '',
    },
    frames: [
      {
        index: Number,
        path: String,
        width: Number,
        height: Number,
      },
    ],
    frameCount: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    hotspots: [hotspotSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Product', productSchema);
