const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  try {
    // Validate required environment variables
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new Error('Missing required email configuration. Please check MAIL_HOST, MAIL_USER, and MAIL_PASS environment variables.');
    }

    // Create a Transporter to send emails
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify transporter configuration
    await transporter.verify();
    
    // Send emails to users
    let info = await transporter.sendMail({
      from: `"StudyNotion Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });
    
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Mail sender error:", error.message);
    throw error;
  }
};

module.exports = mailSender;
