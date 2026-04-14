const { chromium } = require('playwright');

async function theLastStand() {
  const userDataDir = '/home/profesor/snap/chromium/common/chromium/'; 
  const executablePath = '/snap/bin/chromium';
  const targetHandle = 'ottergiggles';
  const text = "Institutional 'safe crypto' is the biggest joke in the space. You can't chase alpha while clutching a safety net. If it's 'safe', it's already priced in. The real money is made in the chaos they're terrified of. 🜂";

  console.log('🚨 LAUNCHING THE LAST STAND...');
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: executablePath,
    headless: true, 
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });

  try {
    const page = await context.newPage();
    
    console.log('🌐 Navigating to Dedicated Composer...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const postBoxSelector = 'div[role="textbox"]';
    const postBox = await page.waitForSelector(postBoxSelector, { timeout: 15000 });
    
    console.log('✍️ Extreme Human Typing...');
    await postBox.click();
    
    const words = text.split(' ');
    for (const word of words) {
      await page.keyboard.type(word + ' ', { delay: Math.random() * 100 + 50 });
      await page.waitForTimeout(Math.random() * 200 + 100);
    }
    
    await page.waitForTimeout(2000);
    
    console.log('🖱️ Simulating Mouse Movement to Post Button...');
    const postButton = await page.waitForSelector('button[data-testid="tweetButton"]');
    const box = await postButton.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      await page.waitForTimeout(500);
      await postButton.click({ force: true, delay: 150 });
    } else {
      await page.keyboard.press('Control+Enter');
    }
    
    console.log('⏳ Waiting 45s for X to process (Anti-Cache)...');
    await page.waitForTimeout(45000);
    
    console.log(`🌐 Verifying on profile @${targetHandle} with Cache-Buster...`);
    await page.goto(`https://x.com/${targetHandle}?t=${Date.now()}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    
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
      console.log(`\n✅ VICTORY! Post verified. Link: ${latestTweet.url}\n`);
    } else {
      console.log('\n❌ FINAL FAILURE: The wall is too high.');
      await page.screenshot({ path: '/home/profesor/.openclaw/workspace/last_stand_fail.png' });
    }

  } catch (error) {
    console.error('❌ Critical Error:', error);
  } finally {
    await context.close();
  }
}

theLastStand();
