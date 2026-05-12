const Post = require('../models/Post');

// ─── List Posts (with filters, search, pagination) ─────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { thread: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Post.countDocuments(filter),
    ]);

    // Also fetch status counts for the sidebar
    const counts = await Post.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusCounts = {};
    counts.forEach(c => { statusCounts[c._id] = c.count; });

    res.json({
      success: true,
      data: posts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
      statusCounts,
    });
  } catch (error) {
    console.error('GetPosts Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching posts.', error: error.message });
  }
};

// ─── Get Single Post ───────────────────────────────────────────────────────
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching post.', error: error.message });
  }
};

// ─── Create Post (used by OpenClaw) ────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const { title, thread, images, status } = req.body;

    if (!title || !thread || !Array.isArray(thread) || thread.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'title and thread (non-empty array) are required.',
      });
    }

    const post = await Post.create({
      title,
      thread,
      images: Array.isArray(images) ? images : [],
      status: status || 'review',
      version: 1,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Create Error:', error);
    res.status(500).json({ success: false, message: 'Error creating post.', error: error.message });
  }
};

// ─── Update Post (used by OpenClaw for redo, or admin edits) ───────────────
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const { title, thread, images, status } = req.body;

    if (title !== undefined) post.title = title;
    if (thread !== undefined) {
      post.thread = thread;
      post.version += 1;
    }
    if (images !== undefined) post.images = images;
    if (status !== undefined) post.status = status;

    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ success: false, message: 'Error updating post.', error: error.message });
  }
};

// ─── Delete Post ───────────────────────────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting post.', error: error.message });
  }
};

// ─── Approve Post ──────────────────────────────────────────────────────────
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (post.status !== 'review') {
      return res.status(400).json({ success: false, message: `Cannot approve post with status "${post.status}". Must be "review".` });
    }

    post.status = 'approved';
    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving post.', error: error.message });
  }
};

// ─── Reject Post ───────────────────────────────────────────────────────────
exports.rejectPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.status = 'rejected';
    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting post.', error: error.message });
  }
};

// ─── Redo Post (send back to OpenClaw) ─────────────────────────────────────
exports.redoPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (post.status !== 'review') {
      return res.status(400).json({ success: false, message: `Cannot redo post with status "${post.status}". Must be "review".` });
    }

    post.status = 'redo';
    // Comments are preserved for OpenClaw to read
    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking post for redo.', error: error.message });
  }
};

// ─── Add Comment (with text highlight selection) ───────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text, selection } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.comments.push({ text, selection: selection || '', createdAt: new Date() });
    await post.save();

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding comment.', error: error.message });
  }
};

// ─── Mark as Published (manual, paste URL) ─────────────────────────────────
exports.markPublished = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ success: false, message: 'A valid URL is required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    if (post.status !== 'approved') {
      return res.status(400).json({ success: false, message: `Cannot publish post with status "${post.status}". Must be "approved".` });
    }

    post.status = 'published';
    post.publishedUrl = url;
    post.publishedAt = new Date();
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking post as published.', error: error.message });
  }
};

// ─── Move to Review (from approved / published) ────────────────────────────
exports.moveToReview = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const allowed = ['approved', 'published', 'rejected'];
    if (!allowed.includes(post.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move post with status "${post.status}" back to review. Allowed: ${allowed.join(', ')}.`,
      });
    }

    post.status = 'review';
    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error moving post to review.', error: error.message });
  }
};


// ─── Get Analytics ─────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    res.json({
      success: true,
      data: {
        analytics: post.analytics,
        publishedUrl: post.publishedUrl,
        publishedAt: post.publishedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching analytics.', error: error.message });
  }
};
