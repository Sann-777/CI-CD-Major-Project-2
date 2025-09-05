const { uploadImageToCloudinary, uploadVideoToCloudinary } = require('../utils/imageUploader');

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const SUPPORTED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const SUPPORTED_VIDEO_TYPES = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'];
const SUPPORTED_DOCUMENT_TYPES = ['pdf', 'doc', 'docx', 'txt', 'rtf'];

// Helper functions
const createErrorResponse = (message, statusCode = 400) => ({
  success: false,
  message,
});

const createSuccessResponse = (data, message) => ({
  success: true,
  message,
  ...data,
});

const validateFileType = (fileName, supportedTypes) => {
  if (!fileName || typeof fileName !== 'string') {
    return false;
  }
  
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  return fileExtension && supportedTypes.includes(fileExtension);
};

const validateFileSize = (fileSize, maxSize) => {
  return fileSize && fileSize <= maxSize;
};

const sanitizeFileName = (fileName) => {
  // Remove special characters and spaces, keep only alphanumeric, dots, hyphens, underscores
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
};

const getFileType = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (SUPPORTED_IMAGE_TYPES.includes(extension)) return 'image';
  if (SUPPORTED_VIDEO_TYPES.includes(extension)) return 'video';
  if (SUPPORTED_DOCUMENT_TYPES.includes(extension)) return 'document';
  
  return 'unknown';
};

// Upload image
exports.uploadImage = async (req, res) => {
  try {
    // Validate file presence
    if (!req.files || !req.files.file) {
      return res.status(400).json(
        createErrorResponse('No file uploaded. Please select an image file.')
      );
    }

    const file = req.files.file;
    
    // Validate file properties
    if (!file.name || !file.size || !file.data) {
      return res.status(400).json(
        createErrorResponse('Invalid file data')
      );
    }

    // Validate file type
    if (!validateFileType(file.name, SUPPORTED_IMAGE_TYPES)) {
      return res.status(400).json(
        createErrorResponse(`Unsupported image format. Supported formats: ${SUPPORTED_IMAGE_TYPES.join(', ')}`)
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_IMAGE_SIZE)) {
      return res.status(413).json(
        createErrorResponse(`Image file too large. Maximum size allowed: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`)
      );
    }

    // Sanitize file name
    const sanitizedFileName = sanitizeFileName(file.name);
    
    // Get folder from request or use default
    const folder = req.body.folder || process.env.FOLDER_NAME || 'uploads';
    
    // Validate folder name
    if (folder && !/^[a-zA-Z0-9_-]+$/.test(folder)) {
      return res.status(400).json(
        createErrorResponse('Invalid folder name')
      );
    }

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadImageToCloudinary(
        { ...file, name: sanitizedFileName }, 
        folder
      );
      
      if (!uploadResult || !uploadResult.secure_url) {
        return res.status(500).json(
          createErrorResponse('Failed to upload image to cloud storage')
        );
      }

      return res.status(200).json(
        createSuccessResponse({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          size: file.size,
          originalName: file.name,
          folder: folder
        }, 'Image uploaded successfully')
      );

    } catch (uploadError) {
      return res.status(500).json(
        createErrorResponse('Failed to upload image. Please try again.')
      );
    }

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Internal server error. Please try again later.')
    );
  }
};

// Upload video
exports.uploadVideo = async (req, res) => {
  try {
    // Validate file presence
    if (!req.files || !req.files.file) {
      return res.status(400).json(
        createErrorResponse('No file uploaded. Please select a video file.')
      );
    }

    const file = req.files.file;
    
    // Validate file properties
    if (!file.name || !file.size || !file.data) {
      return res.status(400).json(
        createErrorResponse('Invalid file data')
      );
    }

    // Validate file type
    if (!validateFileType(file.name, SUPPORTED_VIDEO_TYPES)) {
      return res.status(400).json(
        createErrorResponse(`Unsupported video format. Supported formats: ${SUPPORTED_VIDEO_TYPES.join(', ')}`)
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_VIDEO_SIZE)) {
      return res.status(413).json(
        createErrorResponse(`Video file too large. Maximum size allowed: ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`)
      );
    }

    // Sanitize file name
    const sanitizedFileName = sanitizeFileName(file.name);
    
    // Get folder from request or use default
    const folder = req.body.folder || process.env.FOLDER_NAME || 'videos';
    
    // Validate folder name
    if (folder && !/^[a-zA-Z0-9_-]+$/.test(folder)) {
      return res.status(400).json(
        createErrorResponse('Invalid folder name')
      );
    }

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadVideoToCloudinary(
        { ...file, name: sanitizedFileName }, 
        folder
      );
      
      if (!uploadResult || !uploadResult.secure_url) {
        return res.status(500).json(
          createErrorResponse('Failed to upload video to cloud storage')
        );
      }

      return res.status(200).json(
        createSuccessResponse({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          duration: uploadResult.duration,
          width: uploadResult.width,
          height: uploadResult.height,
          size: file.size,
          originalName: file.name,
          folder: folder
        }, 'Video uploaded successfully')
      );

    } catch (uploadError) {
      return res.status(500).json(
        createErrorResponse('Failed to upload video. Please try again.')
      );
    }

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Internal server error. Please try again later.')
    );
  }
};

// Generic file upload handler
exports.uploadFile = async (req, res) => {
  try {
    // Validate file presence
    if (!req.files || !req.files.file) {
      return res.status(400).json(
        createErrorResponse('No file uploaded')
      );
    }

    const file = req.files.file;
    
    // Validate file properties
    if (!file.name || !file.size || !file.data) {
      return res.status(400).json(
        createErrorResponse('Invalid file data')
      );
    }

    // Determine file type
    const fileType = getFileType(file.name);
    
    if (fileType === 'unknown') {
      return res.status(400).json(
        createErrorResponse('Unsupported file format')
      );
    }

    // Validate file size based on type
    let maxSize = MAX_FILE_SIZE;
    if (fileType === 'image') maxSize = MAX_IMAGE_SIZE;
    if (fileType === 'video') maxSize = MAX_VIDEO_SIZE;

    if (!validateFileSize(file.size, maxSize)) {
      return res.status(413).json(
        createErrorResponse(`File too large. Maximum size allowed: ${maxSize / (1024 * 1024)}MB`)
      );
    }

    // Route to appropriate upload handler
    if (fileType === 'image') {
      return exports.uploadImage(req, res);
    } else if (fileType === 'video') {
      return exports.uploadVideo(req, res);
    } else {
      return res.status(400).json(
        createErrorResponse('File type not supported for upload')
      );
    }

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Internal server error. Please try again later.')
    );
  }
};

// Delete file from Cloudinary
exports.deleteFile = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json(
        createErrorResponse('Public ID is required for file deletion')
      );
    }

    // Validate publicId format
    if (typeof publicId !== 'string' || publicId.trim().length === 0) {
      return res.status(400).json(
        createErrorResponse('Invalid public ID format')
      );
    }

    try {
      const { cloudinary } = require('../config/cloudinary');
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        return res.status(200).json(
          createSuccessResponse({}, 'File deleted successfully')
        );
      } else {
        return res.status(404).json(
          createErrorResponse('File not found or already deleted')
        );
      }

    } catch (deleteError) {
      return res.status(500).json(
        createErrorResponse('Failed to delete file from cloud storage')
      );
    }

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Internal server error. Please try again later.')
    );
  }
};
