const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { 
    type: String,
    required: true,
    trim: true
  },
  courseDescription: { 
    type: String,
    required: true
  },
  instructor: {
    type: String, // User ID from auth service
    required: true,
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReviews: [
    {
      type: String, // Review IDs from rating service
    },
  ],
  price: {
    type: Number,
    required: true
  },
  thumbnail: {
    type: String,
  },
  tag: {
    type: [String],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  studentsEnroled: [
    {
      type: String, // User IDs from auth service
    },
  ],
  instructions: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Draft"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
