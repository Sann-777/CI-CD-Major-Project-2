const request = require('supertest');
const express = require('express');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { getUserDetails, updateProfile, updateDisplayPicture, deleteProfile } = require('../controllers/profileController');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

// Mock dependencies
jest.mock('../models/Profile');
jest.mock('../models/User');
jest.mock('../utils/imageUploader');
jest.mock('mongoose');

describe('Profile Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = global.testUtils.mockRequest();
    res = global.testUtils.mockResponse();
    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getUserDetails', () => {
    it('should get user details successfully', async () => {
      req.user = {
        id: 'userId',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        accountType: 'Student',
      };

      await getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User data fetched successfully',
        data: expect.objectContaining({
          _id: 'userId',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          accountType: 'Student',
          additionalDetails: null,
          image: 'https://api.dicebear.com/5.x/initials/svg?seed=John',
        }),
      });
    });

    it('should handle missing user data gracefully', async () => {
      req.user = { id: 'userId' };

      await getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User data fetched successfully',
        data: expect.objectContaining({
          _id: 'userId',
          firstName: 'User',
          lastName: '',
        }),
      });
    });

    it('should handle errors gracefully', async () => {
      req.user = null;

      await getUserDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateProfile', () => {
    it('should handle errors gracefully', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
      };
      req.user = { id: 'userId' };

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateDisplayPicture', () => {
    it('should handle missing image file', async () => {
      req.files = null;
      req.user = { id: 'userId' };

      await updateDisplayPicture(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle cloudinary upload failure', async () => {
      req.files = {
        displayPicture: {
          tempFilePath: '/tmp/image.jpg',
        },
      };
      req.user = { id: 'userId' };

      uploadImageToCloudinary.mockRejectedValue(new Error('Upload failed'));

      await updateDisplayPicture(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteProfile', () => {
    it('should handle deletion errors', async () => {
      req.user = { id: 'userId' };

      await deleteProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
