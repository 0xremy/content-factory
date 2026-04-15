const Post = require('../models/Post');
const { getTweetMetrics, extractTweetId } = require('../services/xApi');

/**
 * Analytics background job
 * Finds all published posts with a publishedUrl and refreshes their metrics.
 * Designed to be called by node-cron every 30 minutes.
 */
async function runAnalyticsJob() {
  console.log('[AnalyticsJob] Starting analytics refresh...');

  try {
    const posts = await Post.find({ status: 'published', publishedUrl: { $ne: null } });
    console.log(`[AnalyticsJob] Found ${posts.length} published posts to update.`);

    let updated = 0;
    let failed = 0;

    for (const post of posts) {
      try {
        const tweetId = extractTweetId(post.publishedUrl);
        if (!tweetId) {
          console.warn(`[AnalyticsJob] Could not extract tweet ID from: ${post.publishedUrl}`);
          failed++;
          continue;
        }

        const tweetData = await getTweetMetrics(tweetId);
        const metrics = tweetData?.public_metrics;

        if (metrics) {
          post.analytics = {
            impressions: metrics.impression_count || 0,
            likes: metrics.like_count || 0,
            retweets: metrics.retweet_count || 0,
            replies: metrics.reply_count || 0,
          };
          await post.save();
          updated++;
          console.log(`[AnalyticsJob] Updated metrics for "${post.title}"`);
        }
      } catch (err) {
        failed++;
        console.error(`[AnalyticsJob] Error updating "${post.title}":`, err.message || err);
      }
    }

    console.log(`[AnalyticsJob] Complete. Updated: ${updated}, Failed: ${failed}`);
  } catch (error) {
    console.error('[AnalyticsJob] Fatal error:', error);
  }
}

module.exports = { runAnalyticsJob };
