const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  highlightedText: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  user: {
    type: String,
    default: 'Reviewer',
  },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
