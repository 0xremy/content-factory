const { chromium } = require('playwright');

async function getLatestPostLink() {
  const userDataDir = '/home/profesor/snap/chromium/common/chromium/'; 
  const executablePath = '/snap/bin/chromium';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: executablePath,
    headless: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  try {
    const page = await context.newPage();
    console.log('🌐 Navigating to Profile @ottergiggles...');
    await page.goto('https://x.com/ottergiggles', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const firstTweetLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/status/"]'));
      return links.length > 0 ? links[0].href : null;
    });

    if (firstTweetLink) {
      console.log(`🔗 Link found: ${firstTweetLink}`);
    } else {
      console.log('❌ Could not find the latest tweet link.');
    }
  } catch (e) {
    console.error('❌ Error:', e);
  } finally {
    await context.close();
  }
}

getLatestPostLink();
