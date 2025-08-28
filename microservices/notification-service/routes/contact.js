const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { contactUs } = require('../controllers/contactController');

// Validation middleware
const contactValidation = [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
];

// Contact routes
router.post('/contact', contactValidation, contactUs);

module.exports = router;
