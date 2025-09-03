const request = require('supertest');
const express = require('express');
const { capturePayment, verifyPayment, sendPaymentSuccessEmail, getPaymentHistory } = require('../controllers/paymentController');
const Payment = require('../models/Payment');
const axios = require('axios');
const crypto = require('crypto');

// Mock dependencies
jest.mock('../models/Payment');
jest.mock('axios');
jest.mock('../config/razorpay', () => ({
  instance: {
    orders: {
      create: jest.fn(),
    },
  },
}));

describe('Payment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = global.testUtils.mockRequest();
    res = global.testUtils.mockResponse();
    next = global.testUtils.mockNext();
    
    jest.clearAllMocks();
  });

  describe('capturePayment', () => {
    it('should create payment order successfully', async () => {
      req.body = { courses: ['course1'] };
      req.user = { id: 'userId' };
      req.headers = { authorization: 'Bearer token' };

      const mockCourse = {
        price: 1000,
        studentsEnroled: [],
      };

      axios.post.mockResolvedValue({
        data: { data: { courseDetails: mockCourse } },
      });

      const { instance } = require('../config/razorpay');
      instance.orders.create.mockResolvedValue({
        id: 'order_123',
        amount: 100000,
        currency: 'INR',
      });

      await capturePayment(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'order_123',
          amount: 100000,
          currency: 'INR',
        }),
      });
    });

    it('should return error for empty courses', async () => {
      req.body = { courses: [] };
      req.user = { id: 'userId' };

      await capturePayment(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please Provide Course ID',
      });
    });

    it('should handle already enrolled student', async () => {
      req.body = { courses: ['course1'] };
      req.user = { id: 'userId' };
      req.headers = { authorization: 'Bearer token' };

      const mockCourse = {
        price: 1000,
        studentsEnroled: ['userId'],
      };

      axios.post.mockResolvedValue({
        data: { data: { courseDetails: mockCourse } },
      });

      await capturePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Student is already Enrolled',
      });
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      req.body = {
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'signature_123',
        courses: ['course1'],
      };
      req.user = { id: 'userId' };

      // Mock crypto signature verification
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update('order_123|pay_123')
        .digest('hex');
      
      req.body.razorpay_signature = expectedSignature;

      Payment.prototype.save = jest.fn().mockResolvedValue(true);

      await verifyPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment Verified',
      });
    });

    it('should return error for missing payment details', async () => {
      req.body = {};
      req.user = { id: 'userId' };

      await verifyPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Payment Failed',
      });
    });

    it('should return error for invalid signature', async () => {
      req.body = {
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'invalid_signature',
        courses: ['course1'],
      };
      req.user = { id: 'userId' };

      await verifyPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Payment Failed',
      });
    });
  });

  describe('sendPaymentSuccessEmail', () => {
    it('should send payment success email', async () => {
      req.body = {
        orderId: 'order_123',
        paymentId: 'pay_123',
        amount: 1000,
      };
      req.user = { id: 'userId' };
      req.headers = { authorization: 'Bearer token' };

      const mockUser = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      axios.get.mockResolvedValue({ data: { user: mockUser } });
      axios.post.mockResolvedValue({ data: { success: true } });

      await sendPaymentSuccessEmail(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment success email sent',
      });
    });

    it('should handle missing payment details', async () => {
      req.body = {};
      req.user = { id: 'userId' };

      await sendPaymentSuccessEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all the details',
      });
    });
  });

  describe('getPaymentHistory', () => {
    it('should get payment history successfully', async () => {
      req.user = { id: 'userId' };

      const mockPayments = [
        { _id: 'payment1', amount: 1000, status: 'completed' },
        { _id: 'payment2', amount: 2000, status: 'completed' },
      ];

      Payment.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPayments),
      });

      await getPaymentHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPayments,
      });
    });

    it('should handle database error', async () => {
      req.user = { id: 'userId' };

      Payment.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await getPaymentHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch payment history',
        error: 'Database error',
      });
    });
  });
});
