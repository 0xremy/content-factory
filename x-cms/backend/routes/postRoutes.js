const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/ingest', postController.ingestPost);
router.post('/:postId/publish', postController.publishPost);
router.get('/:postId/analytics', postController.getAnalytics);
router.put('/:postId', postController.updatePost);
router.get('/:postId/logs', postController.getEditLogs);
router.post('/feedback', postController.addFeedback);
router.get('/:postId/feedback', postController.getFeedback);

module.exports = router;
