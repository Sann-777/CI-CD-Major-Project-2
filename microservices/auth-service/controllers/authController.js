const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require('../mail/templates/passwordUpdate');

// Constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const OTP_EXPIRY_MINUTES = 5;
const JWT_EXPIRY = '24h';
const COOKIE_EXPIRY_DAYS = 3;

// Helper functions
const validateEmail = (email) => EMAIL_REGEX.test(email);

const validatePassword = (password) => password && password.length >= MIN_PASSWORD_LENGTH;

const validateRequiredFields = (fields) => {
  const missing = [];
  Object.entries(fields).forEach(([key, value]) => {
    if (!value) missing.push(key);
  });
  return missing;
};

const createErrorResponse = (message, statusCode = 400) => ({
  success: false,
  message,
});

const createSuccessResponse = (data, message) => ({
  success: true,
  message,
  ...data,
});

// Signup Controller for Registering Users
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      otp,
    };
    
    const missingFields = validateRequiredFields(requiredFields);
    if (missingFields.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json(
        createErrorResponse('Invalid email format')
      );
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json(
        createErrorResponse(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
      );
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json(
        createErrorResponse('Password and confirm password do not match')
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(
        createErrorResponse('An account with this email already exists')
      );
    }

    // Find the most recent OTP for the email
    const otpRecord = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (otpRecord.length === 0) {
      return res.status(400).json(
        createErrorResponse('No OTP found for this email. Please request a new OTP')
      );
    }
    
    if (otp !== otpRecord[0].otp) {
      return res.status(400).json(
        createErrorResponse('Invalid OTP')
      );
    }

    // Check if OTP has expired
    const otpCreatedAt = new Date(otpRecord[0].createdAt);
    const currentTime = new Date();
    const timeDifference = (currentTime - otpCreatedAt) / (1000 * 60); // in minutes
    if (timeDifference > OTP_EXPIRY_MINUTES) {
      return res.status(400).json(
        createErrorResponse('OTP has expired. Please request a new OTP')
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const approved = accountType !== 'Instructor';

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: accountType || 'Student',
      approved,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // Remove password from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    return res.status(201).json(
      createSuccessResponse({ user: userResponse }, 'User registered successfully')
    );
  } catch (error) {
    return res.status(500).json(
      createErrorResponse('User registration failed. Please try again')
    );
  }
};

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({ email, password });
    if (missingFields.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json(
        createErrorResponse('Invalid email or password')
      );
    }

    // Find user with provided email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(
        createErrorResponse('Invalid email or password')
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        createErrorResponse('Invalid email or password')
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Prepare user response (without password)
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    userResponse.token = token;

    // Set cookie options
    const cookieOptions = {
      expires: new Date(Date.now() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    return res.cookie('token', token, cookieOptions).status(200).json(
      createSuccessResponse({ token, user: userResponse }, 'Login successful')
    );
  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Login failed. Please try again')
    );
  }
};

// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email, checkUserPresent } = req.body;

    if (!email) {
      return res.status(400).json(
        createErrorResponse('Email is required')
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json(
        createErrorResponse('Invalid email format')
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    
    // If checking for new user registration and user exists
    if (checkUserPresent && existingUser) {
      return res.status(409).json(
        createErrorResponse('An account with this email already exists')
      );
    }

    // Generate unique OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Ensure OTP is unique
    let existingOtp = await OTP.findOne({ otp });
    while (existingOtp) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      existingOtp = await OTP.findOne({ otp });
    }

    // Create OTP record
    await OTP.create({ email, otp });

    return res.status(200).json(
      createSuccessResponse({ otp }, 'OTP sent successfully')
    );
  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Failed to send OTP. Please try again later')
    );
  }
};

// Get user by ID (for inter-service communication)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json(
        createErrorResponse('User ID is required')
      );
    }

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    return res.status(200).json(
      createSuccessResponse({ user }, 'User retrieved successfully')
    );
  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Error fetching user')
    );
  }
};

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);
    if (!userDetails) {
      return res.status(404).json(
        createErrorResponse('User not found')
      );
    }

    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({
      oldPassword,
      newPassword,
      confirmNewPassword,
    });
    if (missingFields.length > 0) {
      return res.status(400).json(
        createErrorResponse(`Missing required fields: ${missingFields.join(', ')}`)
      );
    }

    // Validate old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, userDetails.password);
    if (!isOldPasswordValid) {
      return res.status(401).json(
        createErrorResponse('Current password is incorrect')
      );
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json(
        createErrorResponse(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
      );
    }

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json(
        createErrorResponse('New password and confirm password do not match')
      );
    }

    // Update password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { password: hashedNewPassword },
      { new: true }
    );

    // Send notification email
    try {
      await mailSender(
        updatedUser.email,
        'Password Updated Successfully',
        passwordUpdated(
          updatedUser.email,
          `Password updated successfully for ${updatedUser.firstName} ${updatedUser.lastName}`
        )
      );
    } catch (emailError) {
      // Log email error but don't fail the password change
      // In production, you might want to use a proper logging service
    }

    return res.status(200).json(
      createSuccessResponse({}, 'Password updated successfully')
    );
  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Error occurred while updating password')
    );
  }
};
