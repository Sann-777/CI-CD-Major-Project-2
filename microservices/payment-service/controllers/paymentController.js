const { instance } = require('../config/razorpay');
const Payment = require('../models/Payment');
const axios = require('axios');
const crypto = require('crypto');

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" });
  }

  let total_amount = 0;

  for (const course_id of courses) {
    let course;
    try {
      // Fetch course details from course service
      const courseResponse = await axios.post(
        `${process.env.COURSE_SERVICE_URL}/api/v1/course/getCourseDetails`,
        { courseId: course_id },
        { headers: { Authorization: req.headers.authorization } }
      );
      course = courseResponse.data.data.courseDetails;

      // Check if the user is already enrolled in the course
      const uid = userId;
      if (course.studentsEnroled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" });
      }

      total_amount += course.price;
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    res.json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." });
  }
};

// Verify the payment
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses } = req.body;
  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(400).json({ success: false, message: "Payment Failed" });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      // Store payment details
      for (const courseId of courses) {
        const payment = new Payment({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          courseId,
          userId,
          amount: 0, // Will be updated with actual amount
          status: 'completed'
        });
        await payment.save();

        // Enroll the student in the course
        await enrollStudents(courses, userId, res);
      }

      return res.status(200).json({ success: true, message: "Payment Verified" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: "Payment verification failed" });
    }
  } else {
    return res.status(400).json({ success: false, message: "Payment Failed" });
  }
};

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" });
  }

  try {
    // Get user details from auth service
    const userResponse = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/v1/auth/user/${userId}`,
      { headers: { Authorization: req.headers.authorization } }
    );
    const user = userResponse.data.user;

    // Send email via notification service
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notification/payment-success`,
      {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        amount,
        orderId,
        paymentId,
      },
      { headers: { Authorization: req.headers.authorization } }
    );

    res.json({ success: true, message: "Payment success email sent" });
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" });
  }
};

// Enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" });
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      await axios.post(
        `${process.env.COURSE_SERVICE_URL}/api/v1/course/enroll-student`,
        { courseId, userId },
        { headers: { Authorization: req.headers.authorization } }
      );

      // Find the student and add the course to their list of enrolled courses
      await axios.post(
        `${process.env.USER_SERVICE_URL}/api/v1/profile/enroll-course`,
        { userId, courseId },
        { headers: { Authorization: req.headers.authorization } }
      );

      // Send enrollment confirmation email
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notification/course-enrollment`,
        { userId, courseId },
        { headers: { Authorization: req.headers.authorization } }
      );

    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
};

// Get payment history for a user
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};
