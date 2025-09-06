const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
  try {
    // Extract token
    const token = req.cookies.token || 
                  req.body.token || 
                  req.header('Authorization')?.replace('Bearer ', '');

    // If JWT is missing, return 401 Unauthorized response
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: `Token Missing` 
      });
    }

    try {
      // Verify the JWT using the secret key
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (error) {
      // Verification failed, return 401 Unauthorized response
      return res.status(401).json({ 
        success: false, 
        message: 'Token is invalid' 
      });
    }
    
    // If JWT is valid, move to the next middleware or request handler
    next();
  } catch (error) {
    // If there is an error during the authentication process, return 401 Unauthorized response
    return res.status(401).json({
      success: false,
      message: `Something Went Wrong While Validating the Token`,
    });
  }
};
