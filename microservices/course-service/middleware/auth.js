const jwt = require('jsonwebtoken');

// Authentication middleware - validates JWT locally
exports.auth = async (req, res, next) => {
  try {
    const token = 
      req.cookies.token || 
      req.body.token || 
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token Missing' 
      });
    }

    try {
      // Verify token locally using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is invalid' 
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: `Something Went Wrong While Validating the Token`,
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
      message: `User Role Can't be Verified` 
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
      message: `User Role Can't be Verified` 
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
      message: `User Role Can't be Verified` 
    });
  }
};
