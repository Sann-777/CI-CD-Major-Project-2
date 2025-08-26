const express = require('express');
const router = express.Router();

const {
  capturePayment,
  verifyPayment,
  sendPaymentSuccessEmail,
  getPaymentHistory,
} = require('../controllers/paymentController');

const { auth, isStudent } = require('../middleware/auth');

// Payment routes
router.post('/capturePayment', auth, isStudent, capturePayment);
router.post('/verifyPayment', auth, isStudent, verifyPayment);
router.post('/sendPaymentSuccessEmail', auth, isStudent, sendPaymentSuccessEmail);
router.get('/paymentHistory', auth, isStudent, getPaymentHistory);

module.exports = router;
