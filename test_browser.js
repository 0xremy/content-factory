const puppeteer = require('puppeteer');

(async () => {
  console.log('Testing browser session...');
  
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    userDataDir: '/tmp/chrome-test-profile'
  });
  
  const page = await browser.newPage();
  await page.goto('https://x.com');
  
  // Check login status
  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector('[data-testid="loginButton"]') === null;
  });
  
  console.log(`Logged in: ${isLoggedIn}`);
  
  if (isLoggedIn) {
    console.log('Session is logged in.');
    // Try to post a test tweet
    await page.click('[data-testid="tweetButtonInline"]');
    await page.waitForTimeout(1000);
    await page.type('[data-testid="tweetTextarea_0"]', 'Test tweet from automation debug - ' + new Date().toISOString());
    await page.waitForTimeout(1000);
    await page.click('[data-testid="tweetButton"]');
    console.log('Test tweet posted (or attempted).');
  } else {
    console.log('NOT logged in. Manual login required.');
  }
  
  await browser.close();
})();
