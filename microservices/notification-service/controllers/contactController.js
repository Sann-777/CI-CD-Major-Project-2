const { validationResult } = require('express-validator');
const mailSender = require('../utils/mailSender');
const { contactUsEmail } = require('../mail/templates/contactFormRes');

// Constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_NAME_LENGTH = 50;

// Helper functions
const createErrorResponse = (message, errors = null) => ({
  success: false,
  message,
  ...(errors && { errors }),
});

const createSuccessResponse = (data, message) => ({
  success: true,
  message,
  ...data,
});

const validateEmail = (email) => EMAIL_REGEX.test(email);
const validatePhone = (phone) => !phone || PHONE_REGEX.test(phone.replace(/[\s\-\(\)]/g, ''));

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, ''); // Basic XSS protection
};

const validateContactForm = (data) => {
  const errors = [];
  
  if (!data.firstName || data.firstName.length > MAX_NAME_LENGTH) {
    errors.push('First name is required and must be less than 50 characters');
  }
  
  if (!data.lastName || data.lastName.length > MAX_NAME_LENGTH) {
    errors.push('Last name is required and must be less than 50 characters');
  }
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (data.phoneNo && !validatePhone(data.phoneNo)) {
    errors.push('Invalid phone number format');
  }
  
  if (!data.message || data.message.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Message is required and must be less than ${MAX_MESSAGE_LENGTH} characters`);
  }
  
  return errors;
};

exports.contactUs = async (req, res) => {
  try {
    // Check for validation errors from express-validator
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
      return res.status(400).json(
        createErrorResponse('Validation failed', validatorErrors.array())
      );
    }

    // Extract and sanitize input data
    const rawData = req.body;
    const contactData = {
      firstName: sanitizeInput(rawData.firstName),
      lastName: sanitizeInput(rawData.lastName),
      email: sanitizeInput(rawData.email),
      phoneNo: sanitizeInput(rawData.phoneNo),
      message: sanitizeInput(rawData.message),
    };

    // Additional validation
    const customErrors = validateContactForm(contactData);
    if (customErrors.length > 0) {
      return res.status(400).json(
        createErrorResponse('Validation failed', customErrors)
      );
    }

    // Validate admin email configuration
    if (!process.env.MAIL_USER) {
      return res.status(500).json(
        createErrorResponse('Email service not configured properly')
      );
    }

    try {
      // Send email to admin
      const adminEmailResult = await mailSender(
        process.env.MAIL_USER,
        "New Contact Form Submission - StudyNotion",
        contactUsEmail(
          contactData.email,
          contactData.firstName,
          contactData.lastName,
          contactData.message,
          contactData.phoneNo
        )
      );
      
      // Validate email sending result
      if (!adminEmailResult || !adminEmailResult.response) {
        throw new Error('Failed to send admin notification email');
      }
      
      // Send confirmation email to user
      const userConfirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #007bff; margin-top: 0;">Thank you for reaching out!</h2>
          </div>
          
          <p style="font-size: 16px; color: #333;">Dear ${contactData.firstName},</p>
          
          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            We have received your message and appreciate you taking the time to contact us. 
            Our team will review your inquiry and get back to you within 24-48 hours.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333;">Your Message:</h4>
            <p style="margin-bottom: 0; color: #666; font-style: italic;">"${contactData.message}"</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #666;">
              Best regards,<br>
              <strong style="color: #007bff;">StudyNotion Team</strong>
            </p>
          </div>
          
          <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;

      await mailSender(
        contactData.email,
        "Thank you for contacting StudyNotion - We'll be in touch soon!",
        userConfirmationHtml
      );

      return res.status(200).json(
        createSuccessResponse({}, "Your message has been sent successfully. We'll get back to you soon!")
      );

    } catch (emailError) {
      // Log error details for debugging (in production, use proper logging service)
      const errorMessage = emailError.message || 'Unknown email error';
      
      return res.status(500).json(
        createErrorResponse('Failed to send email. Please try again later or contact us directly.')
      );
    }

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Internal server error. Please try again later.')
    );
  }
};
