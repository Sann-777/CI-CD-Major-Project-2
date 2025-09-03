const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendotp, signup, login, changePassword } = require('../controllers/authController');

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

  describe('sendotp', () => {
    it('should send OTP successfully for new email', async () => {
      req.body = { email: 'test@example.com', checkUserPresent: true };
      User.findOne.mockResolvedValue(null);
      OTP.findOne.mockResolvedValue(null);
      OTP.create = jest.fn().mockResolvedValue({ email: 'test@example.com', otp: '123456' });

      await sendotp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'OTP Sent Successfully',
        otp: expect.any(String),
      });
    });

    it('should return error if user already exists', async () => {
      req.body = { email: 'existing@example.com', checkUserPresent: true };
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await sendotp(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    });

    it('should handle invalid email format', async () => {
      req.body = { email: 'invalid-email', checkUserPresent: true };

      await sendotp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password. Please check your credentials and try again.',
      });
    });
  });

  describe('signup', () => {
    it('should create user successfully with valid OTP', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        accountType: 'Student',
        otp: '123456',
      };
      OTP.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ otp: '123456', createdAt: new Date() }]),
        }),
      });
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create = jest.fn().mockResolvedValue({ _id: 'userId', firstName: 'John', lastName: 'Doe', email: 'john@example.com' });

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
        password: 'password123',
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
        password: 'password123',
        confirmPassword: 'password123',
        accountType: 'Student',
        otp: 'wrongOTP',
      };
      OTP.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ otp: '123456', createdAt: new Date() }]),
        }),
      });
      User.findOne.mockResolvedValue(null);

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid OTP. Please check your email and enter the correct OTP.',
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      req.body = {
        email: 'john@example.com',
        password: 'password123',
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
      req.body = { email: 'nonexistent@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password. Please check your credentials and try again.',
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
      const mockUser = {
        _id: 'userId',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedOldPassword',
      };
      req.user = { id: 'userId' };
      req.body = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
        confirmNewPassword: 'newPassword',
      };
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockResolvedValue({ ...mockUser, password: 'hashedNewPassword' });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashedNewPassword');
      
      // Mock mailSender
      const mailSender = require('../utils/mailSender');
      mailSender.mockResolvedValue({ response: 'Email sent' });

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
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
