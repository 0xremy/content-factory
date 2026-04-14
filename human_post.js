const { chromium } = require('playwright');

async function humanPost() {
  const userDataDir = '/home/profesor/snap/chromium/common/chromium/'; 
  const executablePath = '/snap/bin/chromium';
  const targetHandle = 'ottergiggles';
  const text = "Institutional 'safe crypto' is the biggest joke in the space. You can't chase alpha while clutching a safety net. If it's 'safe', it's already priced in. The real money is made in the chaos they're terrified of. 🜂";

  console.log('🚀 Launching Hyper-Human Browser...');
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: executablePath,
    headless: true, 
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  try {
    const page = await context.newPage();
    
    console.log('🌐 Navigating to Home...');
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_home_audit.png' });

    // Find the compose box on the home feed
    const postBoxSelector = 'div[role="textbox"]';
    const postBox = await page.waitForSelector(postBoxSelector, { timeout: 15000 });
    
    console.log('✍️ Typing like a human...');
    await postBox.click();
    await page.waitForTimeout(1000);
    
    for (const char of text) {
      await page.keyboard.type(char, { delay: Math.random() * 100 + 50 });
    }
    
    await page.waitForTimeout(2000);
    
    console.log('🔘 Triggering native JS click...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-testid="tweetButtonInline"]');
      if (btn) {
        btn.click();
      }
    });
    
    console.log('⏳ Waiting 30s for X to process...');
    await page.waitForTimeout(30000);
    
    console.log(`🌐 Verifying on profile @${targetHandle}...`);
    await page.goto(`https://x.com/${targetHandle}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(7000);
    
    const latestTweet = await page.evaluate(() => {
      const tweetElements = document.querySelectorAll('[data-testid="tweetText"]');
      if (tweetElements.length === 0) return null;
      const firstTweet = tweetElements[0];
      const linkEl = firstTweet.closest('[data-testid="tweet"]')?.querySelector('a[href*="/status/"]');
      return {
        text: firstTweet.textContent,
        url: linkEl ? `https://x.com${linkEl.getAttribute('href')}` : null
      };
    });

    if (latestTweet && latestTweet.text.includes(text.substring(0, 20))) {
      console.log(`\n✅ VERIFIED SUCCESS! Link: ${latestTweet.url}\n`);
    } else {
      console.log('\n❌ VERIFICATION FAILED: Still not posted.');
      await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_human_fail.png' });
    }

  } catch (error) {
    console.error('❌ Critical Error:', error);
  } finally {
    await context.close();
  }
}

humanPost();
