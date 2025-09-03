const request = require('supertest');
const express = require('express');
const { uploadImage, uploadVideo } = require('../controllers/mediaController');
const { uploadImageToCloudinary, uploadVideoToCloudinary } = require('../utils/imageUploader');

// Mock dependencies
jest.mock('../utils/imageUploader');

describe('Media Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = global.testUtils.mockRequest();
    res = global.testUtils.mockResponse();
    next = global.testUtils.mockNext();
    
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      req.files = {
        file: {
          name: 'test-image.jpg',
          data: Buffer.from('fake image data'),
          mimetype: 'image/jpeg'
        }
      };

      const mockResponse = {
        public_id: 'test-image-id',
        secure_url: 'https://cloudinary.com/test-image.jpg'
      };

      uploadImageToCloudinary.mockResolvedValue(mockResponse);

      await uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Image uploaded successfully',
        data: mockResponse
      });
    });

    it('should return error when no file is uploaded', async () => {
      req.files = null;

      await uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No file uploaded'
      });
    });

    it('should return error for unsupported file type', async () => {
      req.files = {
        file: {
          name: 'test-file.txt',
          data: Buffer.from('fake data'),
          mimetype: 'text/plain'
        }
      };

      await uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'File format not supported'
      });
    });

    it('should handle cloudinary upload failure', async () => {
      req.files = {
        file: {
          name: 'test-image.png',
          data: Buffer.from('fake image data'),
          mimetype: 'image/png'
        }
      };

      uploadImageToCloudinary.mockRejectedValue(new Error('Cloudinary error'));

      await uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error uploading image',
        error: 'Cloudinary error'
      });
    });
  });

  describe('uploadVideo', () => {
    it('should upload video successfully', async () => {
      req.files = {
        file: {
          name: 'test-video.mp4',
          data: Buffer.from('fake video data'),
          mimetype: 'video/mp4'
        }
      };

      const mockResponse = {
        public_id: 'test-video-id',
        secure_url: 'https://cloudinary.com/test-video.mp4'
      };

      uploadVideoToCloudinary.mockResolvedValue(mockResponse);

      await uploadVideo(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Video uploaded successfully',
        data: mockResponse
      });
    });

    it('should return error when no file is uploaded', async () => {
      req.files = null;

      await uploadVideo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No file uploaded'
      });
    });

    it('should return error for unsupported video format', async () => {
      req.files = {
        file: {
          name: 'test-file.txt',
          data: Buffer.from('fake data'),
          mimetype: 'text/plain'
        }
      };

      await uploadVideo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Video format not supported'
      });
    });

    it('should handle cloudinary upload failure', async () => {
      req.files = {
        file: {
          name: 'test-video.mov',
          data: Buffer.from('fake video data'),
          mimetype: 'video/quicktime'
        }
      };

      uploadVideoToCloudinary.mockRejectedValue(new Error('Cloudinary error'));

      await uploadVideo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error uploading video',
        error: 'Cloudinary error'
      });
    });
  });
});
