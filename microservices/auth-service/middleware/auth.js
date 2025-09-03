const jwt = require('jsonwebtoken');
require('dotenv').config();

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    // Extract token from request
    const token = 
      req.cookies.token || 
      req.body.token || 
      req.header('Authorization')?.replace('Bearer ', '');

    // If JWT is missing, return 401 Unauthorized response
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token Missing', 
      });
    }

    try {
      // Verify the JWT using the secret key
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (error) {
      // If JWT verification fails, return 401 Unauthorized response
      return res.status(401).json({ 
        success: false, 
        message: 'Token is invalid', 
      });
    }
    
    // If JWT is valid, move to the next middleware or route handler
    next();
  } catch (error) {
    // If there is an error during the authentication process, return 401 Unauthorized response
    return res.status(401).json({
      success: false,
      message: 'Something Went Wrong While Validating the Token',
    });
  }
};

// Middleware to check if user is a Student
exports.isStudent = async (req, res, next) => {
  try {
    const userDetails = req.user;

    if (userDetails.accountType !== 'Student') {
      return res.status(401).json({
        success: false,
        message: 'This is a Protected Route for Students',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'User Role Can\'t be Verified', 
    });
  }
};

// Middleware to check if user is an Instructor
exports.isInstructor = async (req, res, next) => {
  try {
    const userDetails = req.user;

    if (userDetails.accountType !== 'Instructor') {
      return res.status(401).json({
        success: false,
        message: 'This is a Protected Route for Instructors',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'User Role Can\'t be Verified', 
    });
  }
};

// Middleware to check if user is an Admin
exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = req.user;

    if (userDetails.accountType !== 'Admin') {
      return res.status(401).json({
        success: false,
        message: 'This is a Protected Route for Admin',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'User Role Can\'t be Verified', 
    });
  }
};
