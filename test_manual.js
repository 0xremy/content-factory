const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🧪 Starting manual test...');
  
  try {
    // 1. Test browser launch
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
      headless: false,  // xvfb-run sẽ cung cấp display
      executablePath: '/usr/bin/chromium-browser',
      userDataDir: '/home/profesor/.config/chromium-automation',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    
    console.log('✅ Browser launched successfully');
    
    // 2. Open page
    const page = await browser.newPage();
    await page.goto('https://x.com', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('🌐 Page loaded:', await page.title());
    
    // 3. Check login status
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('[data-testid="loginButton"]') === null;
    });
    
    console.log('🔐 Logged in:', isLoggedIn);
    
    if (isLoggedIn) {
      // 4. Get username
      const username = await page.evaluate(() => {
        const elem = document.querySelector('[data-testid="UserName"]');
        return elem ? elem.textContent.trim() : 'Unknown';
      });
      console.log('👤 Username:', username.slice(0, 50));
      
      // 5. Test tweet button
      const canTweet = await page.evaluate(() => {
        return document.querySelector('[data-testid="tweetButtonInline"]') !== null;
      });
      console.log('📝 Can tweet:', canTweet);
      
      // 6. Try to compose tweet
      if (canTweet) {
        await page.click('[data-testid="tweetButtonInline"]');
        await page.waitForTimeout(1000);
        await page.type('[data-testid="tweetTextarea_0"]', 'Test tweet from manual debug - ' + new Date().toISOString());
        console.log('✅ Tweet composed (not posted)');
      }
    } else {
      console.log('❌ NOT logged in. Manual login required.');
      console.log('💡 Run: chromium --new-window "https://x.com" --user-data-dir="/home/profesor/.config/chromium-automation"');
    }
    
    // 7. Take screenshot
    await page.screenshot({ path: '/tmp/xvfb_test.png', fullPage: false });
    console.log('📸 Screenshot saved: /tmp/xvfb_test.png');
    
    await browser.close();
    console.log('✅ Test completed successfully');
    
    // Write results to file
    fs.writeFileSync('/tmp/test_results.txt', `Test completed at ${new Date().toISOString()}\nLogged in: ${isLoggedIn}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    fs.writeFileSync('/tmp/test_error.txt', error.stack);
    process.exit(1);
  }
})();
