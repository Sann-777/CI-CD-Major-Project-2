const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getUserDetails,
  updateProfile,
  getEnrolledCourses,
  updateDisplayPicture,
  deleteProfile,
  instructorDashboard
} = require('../controllers/profileController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Profile routes
router.get('/getUserDetails', auth, getUserDetails);
router.put('/updateProfile', auth, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('dateOfBirth').optional().isISO8601(),
  body('about').optional().trim(),
  body('contactNumber').optional().isMobilePhone()
], updateProfile);

router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.put('/updateDisplayPicture', auth, upload.single('displayPicture'), updateDisplayPicture);
router.delete('/deleteProfile', auth, deleteProfile);
router.get('/instructorDashboard', auth, instructorDashboard);

module.exports = router;
