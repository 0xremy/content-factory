exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('GetPosts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching posts.',
      error: error.message,
    });
  }
};

const EditLog = require('../models/EditLog');
const Feedback = require('../models/Feedback');
const { publishThread } = require('../services/threadingEngine');
const { getTweetMetrics } = require('../services/xApi');

exports.ingestPost = async (req, res) => {
  try {
    const { title, content, scheduledAt, tags } = req.body;

    if (!title || !content || !Array.isArray(content)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: title and content (array) are required.',
      });
    }

    // Basic validation for content items
    for (let i = 0; i < content.length; i++) {
      if (content[i].length > 280) {
        return res.status(400).json({
          success: false,
          message: `Content item ${i + 1} exceeds 280 characters.`,
        });
      }
    }

    const post = await Post.create({
      title,
      content,
      scheduledAt,
      tags: tags || [],
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Ingestion Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during ingestion.',
      error: error.message,
    });
  }
};

exports.publishPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    if (post.status === 'publishing') {
      return res.status(400).json({
        success: false,
        message: 'Post is already being published.',
      });
    }

    // Trigger the threading engine in the background
    publishThread(postId).catch(err => {
      console.error(`Background publishing error for ${postId}:`, err);
    });

    res.status(202).json({
      success: true,
      message: 'Publishing process started in background.',
      data: post,
    });
  } catch (error) {
    console.error('Publish Trigger Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error triggering publish.',
      error: error.message,
    });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    if (!post.tweetIds || post.tweetIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post has not been published yet.',
      });
    }

    const metricsPromises = post.tweetIds.map(id => 
      getTweetMetrics(id).catch(err => {
        console.error(`Error fetching metrics for tweet ${id}:`, err);
        return null;
      })
    );

    const results = await Promise.all(metricsPromises);
    const validResults = results.filter(r => r !== null);

    const totals = validResults.reduce((acc, tweet) => {
      const m = tweet.public_metrics || {};
      acc.impressions += (m.impression_count || 0);
      acc.likes += (m.like_count || 0);
      acc.retweets += (m.retweet_count || 0);
      acc.replies += (m.reply_count || 0);
      return acc;
    }, { impressions: 0, likes: 0, retweets: 0, replies: 0 });

    res.status(200).json({
      success: true,
      data: {
        totals,
        tweets: validResults.map(t => ({
          id: t.id,
          metrics: t.public_metrics || {}
        }))
      },
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching analytics.',
      error: error.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, scheduledAt, status, tags } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const oldContent = post.content;

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, content, scheduledAt, status, tags },
      { new: true }
    );

    // Log the edit if content changed
    if (JSON.stringify(oldContent) !== JSON.stringify(content)) {
      await EditLog.create({
        postId,
        oldContent,
        newContent: content,
        status: 'success',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error updating post.',
      error: error.message,
    });
  }
};

exports.getEditLogs = async (req, res) => {
  try {
    const { postId } = req.params;
    const logs = await EditLog.find({ postId }).sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching logs.', error: error.message });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { postId, highlightedText, comment } = req.body;
    const feedback = await Feedback.create({
      postId,
      highlightedText,
      comment,
    });
    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding feedback.', error: error.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const { postId } = req.params;
    const feedbackList = await Feedback.find({ postId }).sort({ timestamp: -1 });
    res.status(200).json({
      success: true,
      data: feedbackList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching feedback.', error: error.message });
  }
};
