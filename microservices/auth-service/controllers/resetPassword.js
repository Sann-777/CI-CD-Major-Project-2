const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const RESET_TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

// Helper functions
const validateEmail = (email) => EMAIL_REGEX.test(email);
const validatePassword = (password) => password && password.length >= MIN_PASSWORD_LENGTH;

const createErrorResponse = (message, statusCode = 400) => ({
  success: false,
  message,
});

const createSuccessResponse = (data, message) => ({
  success: true,
  message,
  ...data,
});

// Reset Password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email presence
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

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(
        createErrorResponse('No account found with this email address')
      );
    }

    // Generate secure reset token
    const token = crypto.randomUUID();
    const resetPasswordExpires = Date.now() + RESET_TOKEN_EXPIRY;

    // Update user with reset token
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        token,
        resetPasswordExpires,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json(
        createErrorResponse('Failed to generate reset token')
      );
    }

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/update-password/${token}`;

    // Send reset email
    try {
      await mailSender(
        email,
        'Password Reset Request - StudyNotion',
        `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password for your StudyNotion account.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
        `
      );
    } catch (emailError) {
      // Rollback token if email fails
      await User.findOneAndUpdate(
        { email },
        {
          $unset: { token: 1, resetPasswordExpires: 1 }
        }
      );

      return res.status(500).json(
        createErrorResponse('Failed to send reset email. Please try again later.')
      );
    }

    return res.status(200).json(
      createSuccessResponse(
        {},
        'Password reset email sent successfully. Please check your email.'
      )
    );
  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Internal server error. Please try again later.')
    );
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    // Validate required fields
    if (!password || !confirmPassword || !token) {
      return res.status(400).json(
        createErrorResponse('Password, confirm password, and token are required')
      );
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json(
        createErrorResponse(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
      );
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json(
        createErrorResponse('Password and confirm password do not match')
      );
    }

    // Find user by token
    const userDetails = await User.findOne({ token });
    if (!userDetails) {
      return res.status(400).json(
        createErrorResponse('Invalid or expired reset token')
      );
    }

    // Check if token has expired
    if (!userDetails.resetPasswordExpires || userDetails.resetPasswordExpires <= Date.now()) {
      return res.status(400).json(
        createErrorResponse('Reset token has expired. Please request a new password reset.')
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    const updatedUser = await User.findOneAndUpdate(
      { token },
      {
        password: hashedPassword,
        $unset: { token: 1, resetPasswordExpires: 1 }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json(
        createErrorResponse('Failed to update password')
      );
    }

    // Send confirmation email
    try {
      await mailSender(
        updatedUser.email,
        'Password Reset Successful - StudyNotion',
        `
        <h2>Password Reset Successful</h2>
        <p>Your password has been successfully reset for your StudyNotion account.</p>
        <p>If you did not make this change, please contact support immediately.</p>
        `
      );
    } catch (emailError) {
      // Don't fail the password reset if email fails
      // Just log the error in production
    }

    return res.status(200).json(
      createSuccessResponse({}, 'Password reset successful. You can now login with your new password.')
    );
  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Internal server error. Please try again later.')
    );
  }
};
