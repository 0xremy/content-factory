const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  selection: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  thread: {
    type: [String],
    required: [true, 'Thread content array is required'],
  },
  images: {
    type: [String], // Array of image URLs, one per tweet (empty string if no image)
    default: [],
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published', 'redo', 'rejected'],
    default: 'review',
  },
  publishedUrl: {
    type: String,
    default: null,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  comments: {
    type: [CommentSchema],
    default: [],
  },
  analytics: {
    impressions: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    retweets: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
  },
  version: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

// Indexes for efficient lookups
PostSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
