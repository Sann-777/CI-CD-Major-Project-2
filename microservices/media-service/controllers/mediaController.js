const { uploadImageToCloudinary, uploadVideoToCloudinary } = require('../utils/imageUploader');

// Upload image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const file = req.files.file;
    
    // Validate file type
    const supportedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (!supportedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: 'File format not supported',
      });
    }

    // Upload to Cloudinary
    const response = await uploadImageToCloudinary(file, process.env.FOLDER_NAME);
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: response,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
    });
  }
};

// Upload video
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const file = req.files.file;
    
    // Validate file type
    const supportedTypes = ['mp4', 'mov', 'avi', 'mkv'];
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (!supportedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: 'Video format not supported',
      });
    }

    // Upload to Cloudinary
    const response = await uploadVideoToCloudinary(file, process.env.FOLDER_NAME);
    
    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: response,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message,
    });
  }
};
