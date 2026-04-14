const { chromium } = require('playwright');

async function executeTruthCycle() {
  const userDataDir = '/home/profesor/snap/chromium/common/chromium/'; 
  const executablePath = '/snap/bin/chromium';
  const targetHandle = 'ottergiggles';
  const text = "Institutional 'safe crypto' is the biggest joke in the space. You can't chase alpha while clutching a safety net. If it's 'safe', it's already priced in. The real money is made in the chaos they're terrified of. 🜂";

  console.log('🚀 Launching Truth-Seeking Browser...');
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: executablePath,
    headless: true, 
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  try {
    const page = await context.newPage();
    
    // STEP 1: POST using CTRL+ENTER
    console.log('✍️ Posting content...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const postBox = await page.waitForSelector('div[role="textbox"]', { timeout: 10000 });
    await postBox.click();
    await postBox.fill(text);
    
    await page.waitForTimeout(1000);
    
    console.log('⌨️ Pressing Ctrl+Enter to post...');
    await page.keyboard.press('Control+Enter');
    
    // Wait for X to process the post
    await page.waitForTimeout(10000);
    
    // STEP 2: VERIFY CONTENT
    console.log(`🌐 Verifying content on profile @${targetHandle}...`);
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
      console.log(`\n✅ VERIFIED SUCCESS! Content matches.`);
      console.log(`🔗 Link: ${latestTweet.url}\n`);
    } else {
      console.log('\n❌ VERIFICATION FAILED: Content does not match or tweet not found.');
      console.log(`Expected start: "${text.substring(0, 20)}"`);
      console.log(`Found start: "${latestTweet ? latestTweet.text.substring(0, 20) : 'NULL'}"`);
      await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_verify_fail.png' });
    }

  } catch (error) {
    console.error('❌ Critical Error:', error);
  } finally {
    await context.close();
  }
}

executeTruthCycle();
