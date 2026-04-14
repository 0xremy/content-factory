import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function scrapeAccounts() {
  console.log('🕵️ Starting Account Monitoring (ESM Mode)...');
  
  const targetsPath = '/home/profesor/.openclaw/workspace/TARGETS.json';
  if (!fs.existsSync(targetsPath)) {
    throw new Error('TARGETS.json not found');
  }
  const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
  
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
      try {
        console.log(`🔎 Checking @${target.handle}...`);
        await page.goto(`https://x.com/${target.handle}`, { waitUntil: 'domcontentloaded' });
        
        try {
          await page.waitForSelector('[data-testid="tweet"]', { timeout: 20000 });
        } catch (e) {
          console.log(`  ⚠️ Timeout waiting for tweets from @${target.handle}. Taking screenshot...`);
          await page.screenshot({ path: `/home/profesor/.openclaw/workspace/debug_${target.handle}.png` });
          continue; 
        }
        
        const tweets = await page.evaluate(() => {
          const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
          return Array.from(tweetElements).slice(0, 5).map(el => {
            const textEl = el.querySelector('[data-testid="tweetText"]');
            const timeEl = el.querySelector('time');
            const linkEl = el.querySelector('a[href*="/status/"]');
            if (!linkEl) return null;
            return {
              id: linkEl.getAttribute('href').split('/').pop(),
              text: textEl ? textEl.textContent : '',
              timestamp: timeEl ? timeEl.getAttribute('datetime') : new Date().toISOString(),
              url: `https://x.com${linkEl.getAttribute('href')}`
            };
          }).filter(t => t !== null);
        });
        
        console.log(`  ✅ Found ${tweets.length} tweets from @${target.handle}`);
        allScrapedTweets.push(...tweets.map(t => ({ ...t, author: target.handle })));
        await page.waitForTimeout(3000);
      } catch (error) {
        console.error(`  ❌ Critical error checking @${target.handle}:`, error.message);
      }
    }
    
    console.log(`📊 Total scraped: ${allScrapedTweets.length} tweets`);
    console.log(JSON.stringify(allScrapedTweets, null, 2));
    
    // Also save to file for persistence
    fs.writeFileSync('/home/profesor/.openclaw/workspace/latest_hunt.json', JSON.stringify(allScrapedTweets, null, 2));
    
    return allScrapedTweets;
  } catch (error) {
    console.error('❌ Error scraping accounts:', error.message);
    throw error;
  } finally {
    await browserContext.close();
  }
}

scrapeAccounts().catch(console.error);
