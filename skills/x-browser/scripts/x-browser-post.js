// CommonJS wrapper for ESM modules
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// We need to run the actual script which must be ESM because of dependencies
// So we create a temporary ESM script and run it

const tweetText = process.argv[2];

if (!tweetText) {
  console.error('Error: No tweet text provided.');
  process.exit(1);
}

const scriptContent = `
import { chromium } from 'playwright-extra';
import stealth from 'playwright-extra-plugin-stealth';
import fs from 'fs';

chromium.use(stealth());

async function postToX(text) {
  const userDataDir = '/home/profesor/snap/chromium/common/chromium/'; 
  const executablePath = '/snap/bin/chromium';
  
  console.log('🚀 Launching Snap Chromium (Dynamic Import Mode)...');
  
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
    await page.goto('https://x.com', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_home.png' });

    console.log('✍️ Going to Compose...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_compose.png' });

    const selectors = [
      'div[role="textbox"]',
      'div[data-testid="tweetTextarea_0"]',
      'div[contenteditable="true"]'
    ];

    let postBox = null;
    for (const selector of selectors) {
      try {
        console.log('Trying selector: ' + selector + '...');
        postBox = await page.waitForSelector(selector, { timeout: 8000 });
        if (postBox) break;
      } catch (e) {}
    }

    if (!postBox) {
      throw new Error('Could not find the post box.');
    }
    
    console.log('✍️ Simulating human typing...');
    await postBox.click();
    await page.waitForTimeout(1000);
    
    for (const char of text) {
      await page.keyboard.type(char, { delay: Math.random() * 100 + 50 });
    }
    
    await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_typed.png' });

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

    await page.click(postButtonSelector);
    console.log('✅ Post button clicked!');
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_final.png' });
    
    console.log('🎉 Successfully posted to X via Stealth Browser!');
  } catch (error) {
    console.error('❌ Error during posting:', error);
    if (page) {
      await page.screenshot({ path: '/home/profesor/.openclaw/workspace/debug_error.png' });
      console.log('📸 Error screenshot saved.');
    }
    process.exit(1);
  } finally {
    await context.close();
  }
}

await postToX(process.argv[2]);
`;

// Write the ESM script to a temp file
const tempScriptPath = '/home/profesor/.openclaw/workspace/skills/x-browser/scripts/temp-runner.mjs';
fs.writeFileSync(tempScriptPath, scriptContent);

console.log('📝 Temp ESM script written. Executing...');

// Execute the ESM script
exec(`node ${tempScriptPath} "${tweetText}"`, (error, stdout, stderr) => {
  console.log(stdout);
  console.error(stderr);
  if (error) {
    console.error('❌ Execution failed:', error);
    process.exit(1);
  }
});