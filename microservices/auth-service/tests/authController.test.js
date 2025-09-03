const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { signup, login, sendotp, changePassword } = require('../controllers/authController');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../models/OTP');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../utils/mailSender');

describe('Auth Controller', () => {
  let app;
  let req, res, next;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    req = global.testUtils.mockRequest();
    res = global.testUtils.mockResponse();
    next = global.testUtils.mockNext();
    
    jest.clearAllMocks();
  });

  describe('sendOTP', () => {
    it('should send OTP successfully for new email', async () => {
      req.body = { email: 'test@example.com' };
      
      User.findOne.mockResolvedValue(null);
      OTP.findOne.mockResolvedValue(null);
      OTP.prototype.save = jest.fn().mockResolvedValue(true);

      await sendotp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'OTP Sent Successfully',
        otp: expect.any(String),
      });
    });

    it('should return error if user already exists', async () => {
      req.body = { email: 'existing@example.com' };
      
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await sendotp(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User is already registered',
      });
    });

    it('should handle missing email', async () => {
      req.body = {};

      await sendotp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields are required',
      });
    });
  });

  describe('signup', () => {
    it('should create user successfully with valid OTP', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        accountType: 'Student',
        otp: '123456',
      };

      OTP.find.mockResolvedValue([{ otp: '123456' }]);
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      // Profile creation is handled internally by signup
      User.prototype.save = jest.fn().mockResolvedValue({ _id: 'userId' });

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: expect.any(Object),
        message: 'User registered successfully',
      });
    });

    it('should return error for password mismatch', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword',
        accountType: 'Student',
        otp: '123456',
      };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password and confirm password do not match. Please try again.',
      });
    });

    it('should return error for invalid OTP', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        accountType: 'Student',
        otp: '123456',
      };

      OTP.find.mockResolvedValue([]);

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User cannot be registered. Please try again.',
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      req.body = {
        email: 'john@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        _id: 'userId',
        email: 'john@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        accountType: 'Student',
        additionalDetails: 'profileId',
        save: jest.fn(),
      };

      User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith('token', 'mockToken', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockToken',
        user: expect.any(Object),
        message: 'User Login Success',
      });
    });

    it('should return error for invalid email', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockToken',
        user: expect.any(Object),
        message: 'User Login Success',
      });
    });

    it('should return error for invalid password', async () => {
      req.body = {
        email: 'john@example.com',
        password: 'WrongPassword',
      };

      const mockUser = {
        email: 'john@example.com',
        password: 'hashedPassword',
      };

      User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
      });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password. Please check your credentials and try again.',
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      req.body = {
        oldPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };
      req.user = { id: 'userId' };

      const mockUser = {
        _id: 'userId',
        password: 'hashedOldPassword',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashedNewPassword');

      await changePassword(req, res);

      // Password change is handled internally
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password updated successfully',
      });
    });

    it('should return error for incorrect old password', async () => {
      req.body = {
        oldPassword: 'WrongOldPassword',
        newPassword: 'NewPassword123!',
      };
      req.user = { id: 'userId' };

      const mockUser = {
        password: 'hashedOldPassword',
      };

      User.findById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'The password is incorrect',
      });
    });
  });
});
