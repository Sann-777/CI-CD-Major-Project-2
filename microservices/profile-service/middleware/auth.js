const jwt = require('jsonwebtoken');
require('dotenv').config();

// Authentication middleware
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
      // Verify the JWT using the secret key
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
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
