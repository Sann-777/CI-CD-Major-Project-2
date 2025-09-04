const jwt = require('jsonwebtoken');
require('dotenv').config();

// Constants
const USER_ROLES = {
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin',
};

// Helper functions
const createErrorResponse = (message, statusCode = 401) => ({
  success: false,
  message,
});

const extractToken = (req) => {
  return req.cookies.token || 
         req.body.token || 
         req.header('Authorization')?.replace('Bearer ', '');
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error('Token Missing');
  }
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token is invalid');
  }
};

const checkUserRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userDetails = req.user;

      if (!userDetails) {
        return res.status(401).json(
          createErrorResponse('User authentication required')
        );
      }

      if (userDetails.accountType !== requiredRole) {
        return res.status(403).json(
          createErrorResponse(`This is a protected route for ${requiredRole}s only`)
        );
      }

      next();
    } catch (error) {
      return res.status(500).json(
        createErrorResponse('User role verification failed')
      );
    }
  };
};

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(
      createErrorResponse(error.message)
    );
  }
};

// Role-based middleware
exports.isStudent = checkUserRole(USER_ROLES.STUDENT);
exports.isInstructor = checkUserRole(USER_ROLES.INSTRUCTOR);
exports.isAdmin = checkUserRole(USER_ROLES.ADMIN);
