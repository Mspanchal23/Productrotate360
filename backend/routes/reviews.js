const express = require('express');
const { body } = require('express-validator');
const {
  createReview,
  getProductReviews,
  deleteReview,
  markHelpful,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/:productId',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ],
  createReview
);

router.get('/:productId', getProductReviews);
router.delete('/:id', protect, deleteReview);
router.patch('/:id/helpful', protect, markHelpful);

module.exports = router;
