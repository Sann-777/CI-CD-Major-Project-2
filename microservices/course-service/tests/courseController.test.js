const request = require('supertest');
const express = require('express');
const Course = require('../models/Course');
const Category = require('../models/Category');
const Section = require('../models/Section');
const SubSection = require('../models/SubSection');
const { createCourse, getAllCourses, getCourseDetails, editCourse, deleteCourse, getInstructorCourses } = require('../controllers/courseController');

// Mock dependencies
jest.mock('../models/Course');
jest.mock('../models/Category');
jest.mock('../models/Section');
jest.mock('../models/SubSection');
jest.mock('axios');

describe('Course Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = global.testUtils.mockRequest();
    res = global.testUtils.mockResponse();
    next = global.testUtils.mockNext();
    
    jest.clearAllMocks();
  });

  describe('createCourse', () => {
    it('should create course successfully', async () => {
      req.body = {
        courseName: 'Test Course',
        courseDescription: 'Test Description',
        whatYouWillLearn: 'Test Learning',
        price: 100,
        category: 'categoryId',
        tag: '["test"]',
        instructions: '["test instructions"]',
      };
      req.files = { thumbnailImage: 'test.jpg' };
      req.user = { id: 'instructorId' };

      const mockCategory = { _id: 'categoryId', name: 'Programming' };
      const mockInstructor = { _id: 'instructorId', firstName: 'John', lastName: 'Doe' };
      const mockCourse = { _id: 'courseId', ...req.body, instructor: 'instructorId' };

      Category.findById.mockResolvedValue(mockCategory);
      Course.create = jest.fn().mockResolvedValue(mockCourse);
      Category.findByIdAndUpdate.mockResolvedValue(mockCategory);
      
      // Mock axios for media service
      const axios = require('axios');
      axios.post = jest.fn().mockResolvedValue({ data: { secure_url: 'http://example.com/thumbnail.jpg' } });

      await createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourse,
        message: 'Course Created Successfully',
      });
    });

    it('should return error for missing required fields', async () => {
      req.body = {
        courseName: 'Test Course',
        // Missing required fields
      };

      await createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'All Fields are Mandatory',
      });
    });

    it('should return error for invalid category', async () => {
      req.body = {
        courseName: 'Test Course',
        courseDescription: 'Test Description',
        whatYouWillLearn: 'Test Learning',
        price: 100,
        category: 'invalidCategoryId',
        tag: '["test"]',
        instructions: '["test instructions"]',
      };
      req.files = { thumbnailImage: 'test.jpg' };
      req.user = { id: 'instructorId' };

      Category.findById.mockResolvedValue(null);

      await createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Category Details Not Found',
      });
    });
  });

  describe('getAllCourses', () => {
    it('should get all courses successfully', async () => {
      const mockCourses = [
        {
          _id: 'course1',
          courseName: 'Course 1',
          price: 99.99,
          thumbnail: 'thumb1.jpg',
          instructor: { firstName: 'John', lastName: 'Doe' },
          ratingAndReviews: [],
        },
        {
          _id: 'course2',
          courseName: 'Course 2',
          price: 149.99,
          thumbnail: 'thumb2.jpg',
          instructor: { firstName: 'Jane', lastName: 'Smith' },
          ratingAndReviews: [],
        },
      ];

      Course.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCourses),
      });

      await getAllCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourses,
      });
    });

    it('should handle error when fetching courses', async () => {
      Course.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      });
      
      // Mock console.error to avoid error output
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await getAllCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Can\'t Fetch Course Data',
        error: expect.any(String),
      });
    });
  });

  describe('getCourseDetails', () => {
    it('should get course details successfully', async () => {
      req.body = { courseId: 'courseId' };

      const mockCourse = {
        _id: 'courseId',
        courseName: 'Test Course',
        courseDescription: 'Test Description',
        instructor: { firstName: 'John', lastName: 'Doe' },
        courseContent: [
          {
            _id: 'sectionId',
            sectionName: 'Section 1',
            subSection: [{ _id: 'subSectionId', title: 'SubSection 1' }],
          },
        ],
        ratingAndReviews: [],
      };

      Course.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      await getCourseDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          courseDetails: mockCourse,
          totalDuration: expect.any(String),
        },
      });
    });

    it('should return error for invalid course ID', async () => {
      req.body = { courseId: 'invalidCourseId' };

      Course.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await getCourseDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Could not find course with id: invalidCourseId',
      });
    });
  });

  describe('editCourse', () => {
    it('should edit course successfully', async () => {
      const mockCourse = {
        _id: 'courseId',
        courseName: 'Test Course',
        save: jest.fn().mockResolvedValue(true),
      };
      const mockUpdatedCourse = {
        _id: 'courseId',
        courseName: 'Updated Course',
        courseDescription: 'Updated Description',
      };
      req.body = {
        courseId: 'courseId',
        courseName: 'Updated Course',
        courseDescription: 'Updated Description',
      };
      Course.findById.mockResolvedValue(mockCourse);
      Course.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUpdatedCourse),
              }),
            }),
          }),
        }),
      });

      await editCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedCourse,
        message: 'Course updated successfully',
      });

    it('should return error for missing course ID', async () => {
      req.body = { courseId: 'invalidId' };
      Course.findById.mockResolvedValue(null);

      await editCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Course not found',
      });
    });
  });

  describe('deleteCourse', () => {
    it('should delete course successfully', async () => {
      req.body = { courseId: 'courseId' };

      const mockCourse = {
        studentsEnroled: ['studentId1', 'studentId2'],
        courseContent: ['sectionId1', 'sectionId2'],
      };
      
      Section.findById.mockResolvedValue({ _id: 'sectionId1', subSection: ['subSectionId1'] });
      SubSection.findByIdAndDelete.mockResolvedValue(true);
      Section.findByIdAndDelete.mockResolvedValue(true);

      const mockSections = [
        { _id: 'sectionId1', subSection: ['subSectionId1'] },
        { _id: 'sectionId2', subSection: ['subSectionId2'] },
      ];
      Course.findById.mockResolvedValue(mockCourse);
      Section.find.mockResolvedValue(mockSections);
      SubSection.deleteMany.mockResolvedValue({ deletedCount: 2 });
      Section.deleteMany.mockResolvedValue({ deletedCount: 2 });
      Course.findById.mockResolvedValue(mockCourse);
      Course.findByIdAndDelete.mockResolvedValue(mockCourse);
      
      // Mock axios for user service
      const axios = require('axios');
      axios.delete = jest.fn().mockResolvedValue({ data: { success: true } });

      await deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course deleted successfully',
      });
    });

    it('should return error for invalid course ID', async () => {
      req.body = { courseId: 'invalidCourseId' };

      Course.findById.mockResolvedValue(null);

      await deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Course not found',
      });
    });
  });

  describe('getInstructorCourses', () => {
    it('should get instructor courses successfully', async () => {
      req.user = { id: 'instructorId' };

      const mockCourses = [
        { _id: 'course1', courseName: 'Course 1', instructor: 'instructorId' },
        { _id: 'course2', courseName: 'Course 2', instructor: 'instructorId' },
      ];
      Course.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCourses),
      });

      await getInstructorCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourses,
      });
    });

    it('should handle error when fetching instructor courses', async () => {
      req.user = { id: 'instructorId' };

      Course.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await getInstructorCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve instructor courses',
        error: expect.any(String),
      });
    });
  });
});
