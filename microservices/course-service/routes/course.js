const express = require('express');
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} = require('../controllers/courseController');

const {
  createSection,
  updateSection,
  deleteSection,
} = require('../controllers/sectionController');

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require('../controllers/subSectionController');

const {
  updateCourseProgress,
  getProgressPercentage,
} = require('../controllers/courseProgressController');

const { auth, isInstructor, isStudent, isAdmin } = require('../middleware/auth');

// Course routes
router.post('/createCourse', auth, isInstructor, createCourse);
router.post('/editCourse', auth, isInstructor, editCourse);
router.get('/getAllCourses', getAllCourses);
router.post('/getCourseDetails', getCourseDetails);
router.post('/getFullCourseDetails', auth, getFullCourseDetails);
router.get('/getInstructorCourses', auth, isInstructor, getInstructorCourses);
router.delete('/deleteCourse', auth, isInstructor, deleteCourse);

// Section routes
router.post('/addSection', auth, isInstructor, createSection);
router.post('/updateSection', auth, isInstructor, updateSection);
router.post('/deleteSection', auth, isInstructor, deleteSection);

// Sub-section routes
router.post('/addSubSection', auth, isInstructor, createSubSection);
router.post('/updateSubSection', auth, isInstructor, updateSubSection);
router.post('/deleteSubSection', auth, isInstructor, deleteSubSection);

// Course progress routes
router.post('/updateCourseProgress', auth, isStudent, updateCourseProgress);
router.post('/getProgressPercentage', auth, isStudent, getProgressPercentage);

module.exports = router;
