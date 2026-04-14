const { execSync } = require('child_process');

const tweets = [
  "RWAs aren’t “big beta” anymore — they’re the liquidity magnet institutions actually deploy into. Pharos flips the script: not just an L1 win, but a real RWA settlement layer that moves real money.",
  "Why Pharos crushes generic L1s:\n- Institutional rails, not campus-level risk\n- Governance built for scale\n- RWA settlement baked in, not optional\n- Pacific Ocean Mainnet encoding real-world capital flows, not idle theater",
  "The GCL moment: $1B validation, not hype. A credible, on‑chain commitment from real-money stacks signals true institutional comfort, de-risks the story, and deepens liquidity for everyone in the ecosystem.",
  "USDC & CCTP liquidity rails are the grease:\n- Instant settlement\n- Cross-chain friction cut to near zero\n- Stable liquidity ladders that survive stress tests\n- Pharos weaves this into core, not as an afterthought",
  "TGE countdown: April 21, Pacific Ocean Mainnet launch.\n- Not a marketing sprint, a real delivery window\n- Liquidity, onboarding, and risk controls all in scope\n- Market will be watching the clock; the clock is a feature, not a bug",
  "Regulatory Arbitrage play vs Ethereum L2s:\n- Pharos lines up with regulated, onshore risk discipline\n- Cross-chain efficiency that actually matters\n- Real-world asset rails + stable liquidity rails create a moat against mispriced L2 drama\n- stake your signal with Pharos now or watch from the sidelines as the tempo shifts",
  "What’s your read: does Pharos rewrite the risk/return calculus for RWAs on‑chain, or is this just a narrative blip that fades with April’s countdown?"
];

console.log('🚀 Starting Pharos Thread Deployment...');

tweets.forEach((tweet, index) => {
  try {
    console.log(`Posting tweet ${index + 1}/${tweets.length}...`);
    // Escape double quotes for the shell command
    const escapedTweet = tweet.replace(/"/g, '\\"');
    execSync(`node /home/profesor/.openclaw/workspace/skills/x-api/scripts/x-post.mjs "${escapedTweet}"`);
    console.log(`✅ Tweet ${index + 1} posted.`);
  } catch (error) {
    console.error(`❌ Error posting tweet ${index + 1}: ${error.message}`);
  }
});

console.log('✨ Thread Deployment Complete!');
