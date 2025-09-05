const { instance } = require('../config/razorpay');
const Payment = require('../models/Payment');
const axios = require('axios');
const crypto = require('crypto');

// Constants
const CURRENCY = 'INR';
const PAYMENT_TIMEOUT = 30000; // 30 seconds
const MIN_AMOUNT = 1; // Minimum payment amount in rupees

// Helper functions
const createErrorResponse = (message, statusCode = 400) => ({
  success: false,
  message,
});

const createSuccessResponse = (data, message) => ({
  success: true,
  message,
  ...data,
});

const validateCourseIds = (courses) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    return 'At least one course ID is required';
  }
  
  for (const courseId of courses) {
    if (!courseId || typeof courseId !== 'string') {
      return 'Invalid course ID format';
    }
  }
  
  return null;
};

const generateReceiptId = () => {
  return `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Capture the payment and initiate the Razorpay order
module.exports.capturePayment = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user?.id;

    // Validate user authentication
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('User authentication required')
      );
    }

    // Validate courses input
    const courseValidationError = validateCourseIds(courses);
    if (courseValidationError) {
      return res.status(400).json(
        createErrorResponse(courseValidationError)
      );
    }

    let totalAmount = 0;
    const courseDetails = [];

    // Fetch and validate each course
    for (const courseId of courses) {
      try {
        const courseResponse = await axios.get(
          `${process.env.COURSE_SERVICE_URL}/api/v1/course/details/${courseId}`,
          { 
            headers: { 
              Authorization: req.headers.authorization 
            },
            timeout: PAYMENT_TIMEOUT
          }
        );

        const course = courseResponse.data.course;
        
        if (!course) {
          return res.status(404).json(
            createErrorResponse(`Course with ID ${courseId} not found`)
          );
        }

        // Check if user is already enrolled
        if (course.studentsEnroled && course.studentsEnroled.includes(userId)) {
          return res.status(409).json(
            createErrorResponse(`You are already enrolled in course: ${course.courseName}`)
          );
        }

        // Validate course price
        if (!course.price || course.price < MIN_AMOUNT) {
          return res.status(400).json(
            createErrorResponse(`Invalid price for course: ${course.courseName}`)
          );
        }

        totalAmount += course.price;
        courseDetails.push({
          id: courseId,
          name: course.courseName,
          price: course.price
        });

      } catch (error) {
        if (error.response?.status === 404) {
          return res.status(404).json(
            createErrorResponse(`Course with ID ${courseId} not found`)
          );
        }
        
        return res.status(500).json(
          createErrorResponse('Failed to fetch course details. Please try again.')
        );
      }
    }

    // Validate total amount
    if (totalAmount < MIN_AMOUNT) {
      return res.status(400).json(
        createErrorResponse('Invalid total amount for payment')
      );
    }

    // Create Razorpay order
    const orderOptions = {
      amount: totalAmount * 100, // Convert to paise
      currency: CURRENCY,
      receipt: generateReceiptId(),
      notes: {
        userId,
        courses: courses.join(','),
        totalCourses: courses.length
      }
    };

    try {
      const paymentResponse = await instance.orders.create(orderOptions);
      
      return res.status(200).json(
        createSuccessResponse({
          order: paymentResponse,
          courseDetails,
          totalAmount
        }, 'Payment order created successfully')
      );

    } catch (razorpayError) {
      return res.status(500).json(
        createErrorResponse('Failed to create payment order. Please try again.')
      );
    }

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Internal server error. Please try again later.')
    );
  }
};

// Verify the payment
module.exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json(
        createErrorResponse('Missing payment verification details')
      );
    }

    if (!userId) {
      return res.status(401).json(
        createErrorResponse('User authentication required')
      );
    }

    const courseValidationError = validateCourseIds(courses);
    if (courseValidationError) {
      return res.status(400).json(
        createErrorResponse(courseValidationError)
      );
    }

    // Verify payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json(
        createErrorResponse('Payment verification failed. Invalid signature.')
      );
    }

    // Get order details from Razorpay
    let orderDetails;
    try {
      orderDetails = await instance.orders.fetch(razorpay_order_id);
    } catch (error) {
      return res.status(500).json(
        createErrorResponse('Failed to fetch order details')
      );
    }

    // Store payment records
    const paymentPromises = courses.map(courseId => {
      const payment = new Payment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseId,
        userId,
        amount: orderDetails.amount / 100, // Convert from paise to rupees
        status: 'completed',
        createdAt: new Date()
      });
      return payment.save();
    });

    await Promise.all(paymentPromises);

    // Enroll students in courses
    try {
      await enrollStudents(courses, userId, req.headers.authorization);
    } catch (enrollmentError) {
      // Payment is successful but enrollment failed
      // This should be handled by a retry mechanism or manual intervention
      return res.status(207).json({
        success: true,
        message: 'Payment verified but enrollment failed. Please contact support.',
        paymentId: razorpay_payment_id
      });
    }

    return res.status(200).json(
      createSuccessResponse({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      }, 'Payment verified and enrollment completed successfully')
    );

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Payment verification failed. Please contact support.')
    );
  }
};

// Send Payment Success Email
module.exports.sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!orderId || !paymentId || !amount || !userId) {
      return res.status(400).json(
        createErrorResponse('Missing required payment details')
      );
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json(
        createErrorResponse('Invalid payment amount')
      );
    }

    try {
      // Get user details from auth service
      const userResponse = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/v1/auth/user/${userId}`,
        { 
          headers: { Authorization: req.headers.authorization },
          timeout: PAYMENT_TIMEOUT
        }
      );

      const user = userResponse.data.user;
      
      if (!user || !user.email) {
        return res.status(404).json(
          createErrorResponse('User details not found')
        );
      }

      // Send email via notification service
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notification/payment-success`,
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          amount,
          orderId,
          paymentId,
        },
        { 
          headers: { Authorization: req.headers.authorization },
          timeout: PAYMENT_TIMEOUT
        }
      );

      return res.status(200).json(
        createSuccessResponse({}, 'Payment confirmation email sent successfully')
      );

    } catch (serviceError) {
      if (serviceError.response?.status === 404) {
        return res.status(404).json(
          createErrorResponse('User not found')
        );
      }
      
      return res.status(500).json(
        createErrorResponse('Failed to send payment confirmation email')
      );
    }

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Internal server error. Please try again later.')
    );
  }
};

// Enroll the student in the courses
const enrollStudents = async (courses, userId, authHeader) => {
  if (!courses || !userId || !authHeader) {
    throw new Error('Missing required enrollment parameters');
  }

  const enrollmentPromises = courses.map(async (courseId) => {
    try {
      // Enroll student in course
      await axios.post(
        `${process.env.COURSE_SERVICE_URL}/api/v1/course/enroll-student`,
        { courseId, userId },
        { 
          headers: { Authorization: authHeader },
          timeout: PAYMENT_TIMEOUT
        }
      );

      // Add course to user's enrolled courses
      await axios.post(
        `${process.env.AUTH_SERVICE_URL}/api/v1/profile/enroll-course`,
        { userId, courseId },
        { 
          headers: { Authorization: authHeader },
          timeout: PAYMENT_TIMEOUT
        }
      );

      // Send enrollment confirmation email
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notification/course-enrollment`,
        { userId, courseId },
        { 
          headers: { Authorization: authHeader },
          timeout: PAYMENT_TIMEOUT
        }
      );

    } catch (error) {
      throw new Error(`Failed to enroll in course ${courseId}: ${error.message}`);
    }
  });

  await Promise.all(enrollmentPromises);
};

// Get payment history for a user
module.exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(
        createErrorResponse('User authentication required')
      );
    }

    const { page = 1, limit = 10 } = req.query;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();

    const totalPayments = await Payment.countDocuments({ userId });
    const totalPages = Math.ceil(totalPayments / limitNum);

    return res.status(200).json(
      createSuccessResponse({
        payments,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPayments,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        }
      }, 'Payment history retrieved successfully')
    );

  } catch (error) {
    return res.status(500).json(
      createErrorResponse('Failed to fetch payment history')
    );
  }
};
