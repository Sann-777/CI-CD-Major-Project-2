const request = require('supertest');
const express = require('express');
const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const { createRating, getAverageRating, getAllRatings } = require('../controllers/ratingController');

// Mock dependencies
jest.mock('../models/RatingAndReview');
jest.mock('../models/Course');

describe('Rating Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = global.testUtils.mockRequest();
    res = global.testUtils.mockResponse();
    next = global.testUtils.mockNext();
    
    jest.clearAllMocks();
  });

  describe('createRating', () => {
    it('should handle validation errors', async () => {
      req.body = {};
      req.user = { id: 'userId' };

      await createRating(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors gracefully', async () => {
      req.body = {
        rating: 5,
        review: 'Great course!',
        course: 'courseId',
      };
      req.user = { id: 'userId' };

      Course.findById.mockRejectedValue(new Error('Database error'));

      await createRating(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAverageRating', () => {
    it('should handle errors gracefully', async () => {
      req.body = { courseId: 'courseId' };

      RatingAndReview.aggregate.mockRejectedValue(new Error('Database error'));

      await getAverageRating(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAllRatings', () => {
    it('should handle error when fetching ratings', async () => {
      RatingAndReview.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockRejectedValue(new Error('Database error')),
            }),
          }),
        }),
      });

      await getAllRatings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error',
      });
    });
  });
});
