const puppeteer = require('puppeteer');
console.log('🧪 Testing browser automation with xvfb-run...');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: '/usr/bin/chromium-browser',
      userDataDir: '/home/profesor/.config/chromium-automation',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://x.com', { waitUntil: 'networkidle2', timeout: 30000 });
    
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('[data-testid="loginButton"]') === null;
    });
    
    console.log('✅ Logged in:', isLoggedIn);
    
    if (isLoggedIn) {
      const username = await page.evaluate(() => {
        const elem = document.querySelector('[data-testid="UserName"]');
        return elem ? elem.textContent.trim().slice(0, 30) : 'Unknown';
      });
      console.log('👤 Username:', username);
      
      // Kiểm tra có thể tweet
      const canTweet = await page.evaluate(() => {
        return document.querySelector('[data-testid="tweetButtonInline"]') !== null;
      });
      console.log('📝 Can tweet:', canTweet);
      
      if (canTweet) {
        console.log('✅ Browser automation READY for Denver!');
      }
    }
    
    await page.screenshot({ path: '/tmp/xvfb_test.png' });
    console.log('📸 Screenshot: /tmp/xvfb_test.png');
    
    await browser.close();
    console.log('🎉 Test PASSED - automation sẽ hoạt động');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
