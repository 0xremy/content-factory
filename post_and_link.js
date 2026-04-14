const { chromium } = require('playwright');

async function executeCycle() {
  const userDataDir = '/home/profesor/snap/chromium/common/chromium/'; 
  const executablePath = '/snap/bin/chromium';
  const targetHandle = 'ottergiggles';
  const text = "Institutional 'safe crypto' is the biggest joke in the space. You can't chase alpha while clutching a safety net. If it's 'safe', it's already priced in. The real money is made in the chaos they're terrified of. 🜂";

  console.log('🚀 Launching Snap Chromium...');
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: executablePath,
    headless: true, 
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  try {
    const page = await context.newPage();
    
    // STEP 1: POST
    console.log('✍️ Posting content...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const postBox = await page.waitForSelector('div[role="textbox"]', { timeout: 10000 });
    await postBox.click();
    await postBox.fill(text);
    
    // Trigger input event for X's React state
    await page.evaluate(() => {
      const el = document.querySelector('div[role="textbox"]');
      if (el) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    await page.waitForTimeout(1000);
    const postBtn = await page.waitForSelector('button[data-testid="tweetButtonInline"]', { timeout: 10000 });
    await postBtn.click({ force: true });
    console.log('✅ Clicked Post button.');
    
    // Wait for the post to actually hit the servers
    await page.waitForTimeout(8000);
    
    // STEP 2: FETCH LINK
    console.log(`🌐 Verifying on profile @${targetHandle}...`);
    await page.goto(`https://x.com/${targetHandle}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    const tweetLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/status/"]'));
      return links.length > 0 ? links[0].href : null;
    });

    if (tweetLink) {
      console.log(`\n🎉 SUCCESS! Post Link: ${tweetLink}\n`);
    } else {
      console.log('\n❌ Post failed or link not found yet. Check debug screenshots.\n');
      await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_final_verify.png' });
    }

  } catch (error) {
    console.error('❌ Critical Error:', error);
  } finally {
    await context.close();
  }
}

executeCycle();
