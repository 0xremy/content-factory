#!/usr/bin/env node
/**
 * Scrape latest tweets from target accounts
 * Usage: node scripts/x-account-scrape.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrapeAccounts() {
  console.log('🕵️ Starting Account Monitoring...');
  
  const targetsPath = path.join(__dirname, '..', '..', '..', 'TARGETS.json');
  if (!fs.existsSync(targetsPath)) {
    throw new Error('TARGETS.json not found');
  }
  const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
  
  // Use the same setup as x-browser-post.mjs
  const userDataDir = '/home/profesor/snap/chromium/common/chromium/'; 
  const executablePath = '/snap/bin/chromium';

  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    executablePath: executablePath,
    headless: true, 
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  
  const page = await browserContext.newPage();
  
  const allScrapedTweets = [];

  try {
    for (const target of targets) {
      console.log(`🔎 Checking @${target.handle}...`);
      await page.goto(`https://x.com/${target.handle}`, { waitUntil: 'domcontentloaded' });
      
      // Wait for tweets to load explicitly
      await page.waitForSelector('[data-testid="tweet"]', { timeout: 15000 });
      
      // Extract tweets
      const tweets = await page.evaluate(() => {
        const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
        return Array.from(tweetElements).slice(0, 5).map(el => {
          const textEl = el.querySelector('[data-testid="tweetText"]');
          const timeEl = el.querySelector('time');
          const linkEl = el.querySelector('a[href*="/status/"]');
          
          if (!linkEl) return null;
          
          const tweetId = linkEl.getAttribute('href').split('/').pop();
          
          return {
            id: tweetId,
            text: textEl ? textEl.textContent : '',
            timestamp: timeEl ? timeEl.getAttribute('datetime') : new Date().toISOString(),
            url: `https://x.com${linkEl.getAttribute('href')}`
          };
        }).filter(t => t !== null);
      });
      
      console.log(`  ✅ Found ${tweets.length} tweets from @${target.handle}`);
      allScrapedTweets.push(...tweets.map(t => ({ ...t, author: target.handle })));
      
      await page.waitForTimeout(2000); // Human-like delay
    }
    
    console.log(`📊 Total scraped: ${allScrapedTweets.length} tweets`);
    return allScrapedTweets;
    
  } catch (error) {
    console.error('❌ Error scraping accounts:', error.message);
    throw error;
  } finally {
    await browserContext.close();
  }
}

if (require.main === module) {
  scrapeAccounts()
    .then(tweets => {
      console.log(JSON.stringify(tweets, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { scrapeAccounts };
