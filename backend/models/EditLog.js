const mongoose = require('mongoose');

const EditLogSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  oldContent: {
    type: [String],
    required: true,
  },
  newContent: {
    type: [String],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: 'success', // success, failed
  },
  editor: {
    type: String, // If we add user auth later
    default: 'admin',
  },
}, { timestamps: true });

module.exports = mongoose.model('EditLog', EditLogSchema);
