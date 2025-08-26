const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  userId: {
    type: String, // User ID from auth service
    required: true
  },
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
  progressPercentage: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);
