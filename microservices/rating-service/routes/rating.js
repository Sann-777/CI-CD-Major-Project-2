const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createRating,
  getAverageRating,
  getAllRatings
} = require('../controllers/ratingController');
const { auth } = require('../middleware/auth');

// Rating routes
router.post('/createRating', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ min: 1, max: 500 }),
  body('course').isMongoId().withMessage('Valid course ID is required')
], createRating);

router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllRatings);

module.exports = router;
