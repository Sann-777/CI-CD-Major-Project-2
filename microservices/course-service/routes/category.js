const express = require('express');
const router = express.Router();

const {
  createCategory,
  showAllCategories,
  categoryPageDetails,
} = require('../controllers/categoryController');

const { auth, isAdmin } = require('../middleware/auth');

// Category routes (Admin only)
router.post('/createCategory', auth, isAdmin, createCategory);
router.get('/showAllCategories', showAllCategories);
router.post('/getCategoryPageDetails', categoryPageDetails);

module.exports = router;
