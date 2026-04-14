const puppeteer = require('puppeteer');
console.log("🧪 Denver debug script...");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/usr/bin/chromium-browser',
    userDataDir: '/home/profesor/.config/chromium-automation',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.goto('https://x.com');
  
  const loggedIn = await page.evaluate(() => {
    return document.querySelector('[data-testid="loginButton"]') === null;
  });
  
  console.log('Login status:', loggedIn);
  
  if (loggedIn) {
    await page.click('[data-testid="tweetButtonInline"]');
    await page.type('[data-testid="tweetTextarea_0"]', 'Denver debug test');
    console.log('Test tweet composed');
  }
  
  await browser.close();
})();
