const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content_en: { type: String, required: true },
  content_vi: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'reviewed', 'published'], 
    default: 'draft' 
  },
  source: { type: String, default: 'TOKYO' },
  published_at: { type: Date },
  x_post_id: { type: String },
  metrics: {
    impressions: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
