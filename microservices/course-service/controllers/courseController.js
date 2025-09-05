const Course = require('../models/Course');
const Category = require('../models/Category');
const Section = require('../models/Section');
const SubSection = require('../models/SubSection');
const CourseProgress = require('../models/CourseProgress');
const axios = require('axios');

// Constants
const DEFAULT_STATUS = 'Draft';
const REQUIRED_COURSE_FIELDS = [
  'courseName',
  'courseDescription', 
  'whatYouWillLearn',
  'price',
  'category'
];

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

const validateRequiredFields = (fields, requiredFields) => {
  const missing = [];
  requiredFields.forEach(field => {
    if (!fields[field]) {
      missing.push(field);
    }
  });
  return missing;
};

const parseJsonSafely = (jsonString, fieldName) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid JSON format for ${fieldName}`);
  }
};

const validatePrice = (price) => {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice >= 0;
};

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;

    // Validate required fields
    const fields = {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
    };

    const missingFields = validateRequiredFields(fields, REQUIRED_COURSE_FIELDS);
    if (missingFields.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
      );
    }

    // Validate price
    if (!validatePrice(price)) {
      return res.status(400).json(
        createErrorResponse('Price must be a valid non-negative number')
      );
    }

    // Get thumbnail image from request files
    const thumbnail = req.files?.thumbnailImage;
    if (!thumbnail) {
      return res.status(400).json(
        createErrorResponse('Thumbnail image is required')
      );
    }

    // Parse and validate tag and instructions
    let tag, instructions;
    try {
      tag = _tag ? parseJsonSafely(_tag, 'tag') : [];
      instructions = _instructions ? parseJsonSafely(_instructions, 'instructions') : [];
    } catch (error) {
      return res.status(400).json(
        createErrorResponse(error.message)
      );
    }

    if (!Array.isArray(tag) || tag.length === 0) {
      return res.status(400).json(
        createErrorResponse('At least one tag is required')
      );
    }

    if (!Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json(
        createErrorResponse('At least one instruction is required')
      );
    }

    // Set default status if not provided
    if (!status) {
      status = DEFAULT_STATUS;
    }

    // Validate instructor
    const instructorId = req.user?.id;
    if (!instructorId) {
      return res.status(401).json(
        createErrorResponse('Instructor authentication required')
      );
    }

    // Verify category exists
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json(
        createErrorResponse('Category not found')
      );
    }

    // Upload thumbnail to media service
    let thumbnailUrl;
    try {
      const mediaServiceUrl = process.env.MEDIA_SERVICE_URL || 'http://localhost:3007';
      const formData = new FormData();
      formData.append('file', thumbnail.data, thumbnail.name);
      formData.append('folder', 'courses');

      const uploadResponse = await axios.post(
        `${mediaServiceUrl}/api/v1/media/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      thumbnailUrl = uploadResponse.data.url;
    } catch (error) {
      return res.status(500).json(
        createErrorResponse('Failed to upload thumbnail image')
      );
    }

    // Create new course
    const newCourse = await Course.create({
      courseName: courseName.trim(),
      courseDescription: courseDescription.trim(),
      instructor: instructorId,
      whatYouWillLearn: whatYouWillLearn.trim(),
      price: Number(price),
      tag,
      category,
      thumbnail: thumbnailUrl,
      status,
      instructions,
    });

    // Add course to category
    await Category.findByIdAndUpdate(
      category,
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    return res.status(201).json(
      createSuccessResponse({ course: newCourse }, 'Course created successfully')
    );

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Failed to create course. Please try again.')
    );
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10))); // Max 50 items per page
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'firstName lastName email')
      .populate('category', 'name description')
      .populate('ratingAndReviews')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();

    const totalCourses = await Course.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limitNum);

    return res.status(200).json(
      createSuccessResponse({
        courses,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCourses,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        }
      }, 'Courses retrieved successfully')
    );

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Failed to retrieve courses')
    );
  }
};

// Get course details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json(
        createErrorResponse('Course ID is required')
      );
    }

    const course = await Course.findById(courseId)
      .populate({
        path: 'instructor',
        select: 'firstName lastName email image',
      })
      .populate('category')
      .populate('ratingAndReviews')
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
        },
      })
      .lean();

    if (!course) {
      return res.status(404).json(
        createErrorResponse('Course not found')
      );
    }

    return res.status(200).json(
      createSuccessResponse({ course }, 'Course details retrieved successfully')
    );

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Failed to retrieve course details')
    );
  }
};

// Get full course details (authenticated user)
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json(
        createErrorResponse('Course ID is required')
      );
    }

    const course = await Course.findById(courseId)
      .populate({
        path: 'instructor',
        select: 'firstName lastName email image',
      })
      .populate('category')
      .populate('ratingAndReviews')
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
        },
      })
      .lean();

    if (!course) {
      return res.status(404).json(
        createErrorResponse('Course not found')
      );
    }

    // Get course progress for the user
    let courseProgress = null;
    if (userId) {
      courseProgress = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      });
    }

    return res.status(200).json(
      createSuccessResponse({ 
        course,
        courseProgress: courseProgress ? courseProgress.completedVideos : []
      }, 'Full course details retrieved successfully')
    );

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Failed to retrieve full course details')
    );
  }
};

// Get instructor courses
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      return res.status(401).json(
        createErrorResponse('Instructor authentication required')
      );
    }

    const courses = await Course.find({ instructor: instructorId })
      .populate('category', 'name')
      .populate('courseContent')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(
      createSuccessResponse({ courses }, 'Instructor courses retrieved successfully')
    );

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Failed to retrieve instructor courses')
    );
  }
};

// Update course
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    if (!courseId) {
      return res.status(400).json(
        createErrorResponse('Course ID is required')
      );
    }

    // Find course and verify ownership
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json(
        createErrorResponse('Course not found')
      );
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json(
        createErrorResponse('Not authorized to edit this course')
      );
    }

    // Validate price if provided
    if (updates.price !== undefined && !validatePrice(updates.price)) {
      return res.status(400).json(
        createErrorResponse('Price must be a valid non-negative number')
      );
    }

    // Handle thumbnail update
    if (req.files?.thumbnailImage) {
      try {
        const mediaServiceUrl = process.env.MEDIA_SERVICE_URL || 'http://localhost:3007';
        const formData = new FormData();
        formData.append('file', req.files.thumbnailImage.data, req.files.thumbnailImage.name);
        formData.append('folder', 'courses');

        const uploadResponse = await axios.post(
          `${mediaServiceUrl}/api/v1/media/upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
          }
        );

        updates.thumbnail = uploadResponse.data.url;
      } catch (error) {
        return res.status(500).json(
          createErrorResponse('Failed to upload new thumbnail')
        );
      }
    }

    // Parse JSON fields if provided
    if (updates.tag && typeof updates.tag === 'string') {
      try {
        updates.tag = parseJsonSafely(updates.tag, 'tag');
      } catch (error) {
        return res.status(400).json(createErrorResponse(error.message));
      }
    }

    if (updates.instructions && typeof updates.instructions === 'string') {
      try {
        updates.instructions = parseJsonSafely(updates.instructions, 'instructions');
      } catch (error) {
        return res.status(400).json(createErrorResponse(error.message));
      }
    }

    // Sanitize string fields
    const stringFields = ['courseName', 'courseDescription', 'whatYouWillLearn'];
    stringFields.forEach(field => {
      if (updates[field]) {
        updates[field] = updates[field].trim();
      }
    });

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updates,
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName email')
     .populate('category', 'name description');

    return res.status(200).json(
      createSuccessResponse({ course: updatedCourse }, 'Course updated successfully')
    );

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Failed to update course')
    );
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json(
        createErrorResponse('Course ID is required')
      );
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json(
        createErrorResponse('Course not found')
      );
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json(
        createErrorResponse('Not authorized to delete this course')
      );
    }

    // Delete associated sections and subsections
    const sections = await Section.find({ _id: { $in: course.courseContent } });
    for (const section of sections) {
      await SubSection.deleteMany({ _id: { $in: section.subSection } });
    }
    await Section.deleteMany({ _id: { $in: course.courseContent } });

    // Remove course from category
    await Category.findByIdAndUpdate(
      course.category,
      { $pull: { courses: courseId } }
    );

    // Delete course progress records
    await CourseProgress.deleteMany({ courseID: courseId });

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json(
      createSuccessResponse({}, 'Course deleted successfully')
    );

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Failed to delete course')
    );
  }
};
