const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required for internal management'],
  },
  content: {
    type: [String],
    required: [true, 'Post content array is required'],
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['draft', 'queued', 'publishing', 'published', 'failed'],
    default: 'draft',
  },
  tweetIds: {
    type: [String], // Array of X Tweet IDs for the thread
    default: [],
  },
  errorMessage: {
    type: String,
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for efficient scheduling lookups
PostSchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model('Post', PostSchema);
