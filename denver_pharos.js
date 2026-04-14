#!/usr/bin/env node
// Denver automation script for Pharos Network thread
const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 DENVER: Starting browser automation...');
  console.log('📁 Profile:', '/home/profesor/.config/chromium-automation');
  
  try {
    // Launch browser with saved profile
    const browser = await puppeteer.launch({
      headless: false,  // xvfb-run provides display
      executablePath: '/usr/bin/chromium-browser',
      userDataDir: '/home/profesor/.config/chromium-automation',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    
    console.log('✅ Browser launched');
    
    const page = await browser.newPage();
    await page.goto('https://x.com', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('🌐 Page loaded:', await page.title());
    
    // Check login status
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('[data-testid="loginButton"]') === null;
    });
    
    console.log('🔐 Logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('❌ ERROR: Not logged in. Manual login required.');
      console.log('💡 Run: chromium --new-window "https://x.com" --user-data-dir="/home/profesor/.config/chromium-automation"');
      await browser.close();
      process.exit(1);
    }
    
    // Get username for confirmation
    const username = await page.evaluate(() => {
      const elem = document.querySelector('[data-testid="UserName"]');
      return elem ? elem.textContent.trim().slice(0, 50) : 'Unknown';
    });
    console.log('👤 Username:', username);
    
    // Verify tweet button exists
    const canTweet = await page.evaluate(() => {
      return document.querySelector('[data-testid="tweetButtonInline"]') !== null;
    });
    console.log('📝 Tweet button available:', canTweet);
    
    if (!canTweet) {
      console.log('❌ ERROR: Tweet button not found');
      await browser.close();
      process.exit(1);
    }
    
    // Helper function for delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    // POST TWEET 1: Main hook
    console.log('\n📤 Posting Tweet 1...');
    await page.click('[data-testid="tweetButtonInline"]');
    await delay(1500);
    
    await page.type('[data-testid="tweetTextarea_0"]', '🚀 Pharos Network – The RWA Bridge\n\nForget generic L1s.\n\nPharos is built for one thing: tokenizing real-world assets (bonds, real estate, private credit).\n\n- Ex-Ant Group team (Hack VC, Faction VC)\n- EVM-compatible, 50k TPS, sub-second finality\n- Targets $50T+ RWA market');
    
    await page.click('[data-testid="tweetButton"]');
    console.log('✅ Tweet 1 posted');
    await delay(3000);
    
    // POST TWEET 2: Continuation
    console.log('\n📤 Posting Tweet 2...');
    await page.click('[data-testid="tweetButtonInline"]');
    await delay(1500);
    
    await page.type('[data-testid="tweetTextarea_0"]', 'This isn\'t another meme chain.\n\nIt\'s infrastructure for TradFi to finally move on-chain.\n\nBull case: 5–10x upside\nBear case: ~70% risk\n\nHidden insights:\n- Photovoltaic valuation arbitrage\n- Hong Kong crypto ambition proxy\n- Bundle-deal innovations\n\nSources: AltcoinBuzz, Bitget, Stakely');
    
    await page.click('[data-testid="tweetButton"]');
    console.log('✅ Tweet 2 posted');
    await delay(2000);
    
    // Take screenshot for verification
    await page.screenshot({ path: '/tmp/denver_post_result.png' });
    console.log('📸 Screenshot saved: /tmp/denver_post_result.png');
    
    await browser.close();
    console.log('\n🎉 SUCCESS: Pharos Network thread posted!');
    console.log('✅ Browser automation completed');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();