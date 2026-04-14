const Post = require('../models/Post');
const { postTweet } = require('./xApi');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function publishThread(postId) {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Post not found');

  console.log(`[ThreadingEngine] Starting publication for post: ${post.title}`);
  
  // Update status to publishing
  post.status = 'publishing';
  await post.save();

  // Resume capability: Start from where we left off if tweetIds already exist
  let startIndex = post.tweetIds.length;
  let previousTweetId = post.tweetIds.length > 0 ? post.tweetIds[post.tweetIds.length - 1] : null;
  const tweetIds = [...post.tweetIds];

  console.log(`[ThreadingEngine] Resuming/Starting from tweet index ${startIndex}`);

  try {
    for (let i = startIndex; i < post.content.length; i++) {
      const text = post.content[i];
      console.log(`[ThreadingEngine] Posting tweet ${i + 1}/${post.content.length}...`);

      let attempts = 0;
      const maxAttempts = 3;
      let success = false;
      let lastError = null;

      while (attempts < maxAttempts && !success) {
        try {
          const tweetId = await postTweet(text, previousTweetId);
          tweetIds.push(tweetId);
          previousTweetId = tweetId;
          success = true;
          console.log(`[ThreadingEngine] Tweet ${i + 1} posted. ID: ${tweetId}`);
          
          // Persist progress after every successful tweet to allow resume on crash
          post.tweetIds = tweetIds;
          await post.save();
        } catch (error) {
          attempts++;
          lastError = error;

          if (error.status === 429) {
            const waitTime = 15 * 1000 * attempts; 
            console.warn(`[ThreadingEngine] Rate limited (429). Retrying in ${waitTime}ms...`);
            await sleep(waitTime);
          } else if (error.status >= 500) {
            const waitTime = 2000 * attempts;
            console.warn(`[ThreadingEngine] X API Server Error (${error.status}). Retrying...`);
            await sleep(waitTime);
          } else {
            console.error(`[ThreadingEngine] Non-retryable error:`, error.data);
            throw error;
          }
        }
      }

      if (!success) {
        throw new Error(`Failed to post tweet ${i + 1} after ${maxAttempts} attempts. Last error: ${lastError?.data?.detail || lastError?.message}`);
      }
    }

    // Successfully published all tweets
    post.status = 'published';
    await post.save();
    console.log(`[ThreadingEngine] Successfully published thread: ${post.title}`);
    return { success: true, tweetIds };

  } catch (error) {
    console.error(`[ThreadingEngine] Critical error publishing thread ${postId}:`, error);
    post.status = 'failed';
    post.errorMessage = error.message || 'Unknown error occurred during publication';
    await post.save();
    throw error;
  }
}

module.exports = { publishThread };
