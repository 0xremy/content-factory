const express = require('express');
const router = express.Router();
const c = require('../controllers/postController');

// CRUD
router.get('/', c.getPosts);
router.get('/:id', c.getPost);
router.post('/', c.createPost);
router.patch('/:id', c.updatePost);
router.delete('/:id', c.deletePost);

// Workflow Actions
router.post('/:id/approve', c.approvePost);
router.post('/:id/reject', c.rejectPost);
router.post('/:id/redo', c.redoPost);
router.post('/:id/comment', c.addComment);

// Manual Publish
router.post('/:id/mark-published', c.markPublished);

// Move back to Review
router.post('/:id/move-to-review', c.moveToReview);

// Analytics
router.get('/:id/analytics', c.getAnalytics);

module.exports = router;
