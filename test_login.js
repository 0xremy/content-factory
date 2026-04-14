const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser with saved profile...');
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/usr/bin/chromium-browser',
    userDataDir: '/home/profesor/.config/chromium-automation',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.goto('https://x.com', { waitUntil: 'networkidle2' });
  
  // Check login status
  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector('[data-testid="loginButton"]') === null;
  });
  
  console.log('✅ Logged in:', isLoggedIn);
  
  if (isLoggedIn) {
    console.log('✅ Session maintained! Ready for automation.');
    
    // Kiểm tra username
    const username = await page.evaluate(() => {
      const elem = document.querySelector('[data-testid="UserName"]');
      return elem ? elem.textContent : 'Unknown';
    });
    console.log('👤 Username:', username.slice(0, 50));
  } else {
    console.log('❌ Not logged in. Manual login required.');
  }
  
  await browser.close();
})();
