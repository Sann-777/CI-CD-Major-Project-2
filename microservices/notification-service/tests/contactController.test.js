const request = require('supertest');
const express = require('express');
const { contactUs } = require('../controllers/contactController');
const mailSender = require('../utils/mailSender');

// Mock dependencies
jest.mock('../utils/mailSender');

describe('Contact Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = global.testUtils.mockRequest();
    res = global.testUtils.mockResponse();
    next = global.testUtils.mockNext();
    
    jest.clearAllMocks();
  });

  describe('contactUs', () => {
    it('should send contact email successfully', async () => {
      req.body = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        message: 'This is a test message',
        phoneNo: '1234567890',
      };

      mailSender.mockResolvedValue(true);

      await contactUs(req, res);

      expect(mailSender).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Email sent successfully',
      });
    });

    it('should handle missing required fields', async () => {
      req.body = {
        email: 'user@example.com',
        // Missing other required fields
      };

      await contactUs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong...',
      });
    });

    it('should handle email sending failure', async () => {
      req.body = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        message: 'This is a test message',
        phoneNo: '1234567890',
      };

      mailSender.mockRejectedValue(new Error('Email sending failed'));

      await contactUs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong...',
      });
    });

    it('should validate email format', async () => {
      req.body = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
        message: 'This is a test message',
        phoneNo: '1234567890',
      };

      await contactUs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle empty message', async () => {
      req.body = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        message: '',
        phoneNo: '1234567890',
      };

      await contactUs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
