const { validationResult } = require('express-validator');
const mailSender = require('../utils/mailSender');
const { contactUsEmail } = require('../mail/templates/contactFormRes');

exports.contactUs = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, phoneNo, message } = req.body;

    try {
      // Send email to admin
      const emailRes = await mailSender(
        process.env.MAIL_USER,
        'New Contact Form Submission - StudyNotion',
        contactUsEmail(email, firstName, lastName, message, phoneNo),
      );
      
      console.log('Contact form email sent successfully:', emailRes.response);
      
      // Send confirmation email to user
      await mailSender(
        email,
        'Thank you for contacting StudyNotion',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for reaching out!</h2>
          <p>Dear ${firstName},</p>
          <p>We have received your message and will get back to you within 24-48 hours.</p>
          <p>Your message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 0;">${message}</p>
          </div>
          <p>Best regards,<br>StudyNotion Team</p>
        </div>`,
      );

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
      });
    } catch (error) {
      console.error('Error sending contact form email:', error);
      return res.status(500).json({
        success: false,
        message: 'Error occurred while sending email',
        error: error.message,
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
