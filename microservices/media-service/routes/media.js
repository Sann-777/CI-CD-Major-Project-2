const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadVideo
} = require('../controllers/mediaController');
const { auth } = require('../middleware/auth');

// Media upload routes
router.post('/upload', auth, uploadImage);
router.post('/upload-video', auth, uploadVideo);

module.exports = router;
