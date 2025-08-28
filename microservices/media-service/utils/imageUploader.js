const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  const options = { folder };
  
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = 'auto';

  return await cloudinary.uploader.upload(file.tempFilePath, options);
};

exports.uploadVideoToCloudinary = async (file, folder) => {
  const options = { 
    folder,
    resource_type: 'video',
    chunk_size: 6000000, // 6MB chunks
  };

  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
