const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  login,
  signup,
  sendotp,
  changePassword,
  getUserById,
} = require('../controllers/authController');
const {
  resetPasswordToken,
  resetPassword,
} = require('../controllers/resetPassword');
const { auth } = require('../middleware/auth');

// Validation middleware
const signupValidation = [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('accountType').isIn(['Admin', 'Student', 'Instructor']).withMessage('Valid account type is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
];

// Authentication routes
router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/sendotp', [body('email').isEmail()], sendotp);
router.post('/changepassword', auth, changePassword);
router.get('/user/:id', auth, getUserById);

// Reset Password routes
router.post('/reset-password-token', resetPasswordToken);
router.post('/reset-password', resetPassword);

module.exports = router;
