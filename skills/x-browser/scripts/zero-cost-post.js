const { chromium } = require('playwright');
const fs = require('fs');

async function postToX(text) {
  const userDataDir = '/home/profesor/snap/chromium/common/chromium/'; 
  const executablePath = '/snap/bin/chromium';
  
  console.log('🚀 Launching Snap Chromium (Minimalist Mode)...');
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: executablePath,
    headless: true, 
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  let page = null;
  try {
    page = await context.newPage();
    
    console.log('🌐 Navigating to X...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const selectors = [
      'div[role="textbox"]',
      'div[data-testid="tweetTextarea_0"]',
      'div[contenteditable="true"]'
    ];

    let postBox = null;
    for (const selector of selectors) {
      try {
        postBox = await page.waitForSelector(selector, { timeout: 8000 });
        if (postBox) break;
      } catch (e) {}
    }

    if (!postBox) throw new Error('Could not find the post box.');
    
    console.log('✍️ Filling content...');
    await postBox.click();
    await postBox.fill(text);
    await page.waitForTimeout(1000);
    
    console.log('🔘 Waiting for Post button to enable...');
    const postButtonSelector = 'button[data-testid="tweetButtonInline"]';
    await page.waitForSelector(postButtonSelector, { timeout: 8000 });
    
    await page.waitForFunction(
      (sel) => {
        const btn = document.querySelector(sel);
        return btn && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true';
      },
      postButtonSelector,
      { timeout: 15000 }
    );
    
    await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_ready.png' });
    await page.click(postButtonSelector);
    
    await page.waitForTimeout(5000);
    console.log('🎉 Successfully posted to X!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await context.close();
  }
}

const tweetText = process.argv[2];
if (!tweetText) {
  console.error('Error: No tweet text provided.');
  process.exit(1);
}

postToX(tweetText);
