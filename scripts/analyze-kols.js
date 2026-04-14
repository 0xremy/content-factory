#!/usr/bin/env node
// Analyze KOL Twitter accounts using Puppeteer
// Usage: node analyze-kols.js

import puppeteer from 'puppeteer';

const KOLS = [
  'jackvi810',
  '0xvietnguyen', 
  '5phutcrypto_'
];

async function analyzeKOL(username) {
  console.log(`\n=== Analyzing @${username} ===`);
  
  try {
    await page.goto(`https://x.com/${username}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Get page content for analysis
    const tweets = await page.evaluate(() => {
      const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
      return Array.from(tweetElements).slice(0, 10).map(el => {
        const text = el.querySelector('[data-testid="tweetText"]')?.textContent || '';
        const time = el.querySelector('time')?.textContent || '';
        const likes = el.querySelector('[data-testid="like"]')?.textContent || '0';
        const retweets = el.querySelector('[data-testid="retweet"]')?.textContent || '0';
        return { text: text.slice(0, 200), time, likes, retweets };
      });
    });
    
    console.log(`Found ${tweets.length} tweets`);
    
    // Get profile info
    const profile = await page.evaluate(() => {
      const name = document.querySelector('[data-testid="UserName"] span')?.textContent || '';
      const bio = document.querySelector('[data-testid="UserDescription"]')?.textContent || '';
      const followers = document.querySelector('a[href*="/followers"] span')?.textContent || '';
      return { name, bio, followers };
    });
    
    console.log(`Profile: ${profile.name}`);
    console.log(`Bio: ${profile.bio}`);
    console.log(`Followers: ${profile.followers}`);
    console.log('\nRecent tweets:');
    tweets.forEach((t, i) => {
      console.log(`\n[${i+1}] ${t.time}`);
      console.log(t.text);
      console.log(`❤️ ${t.likes} 🔁 ${t.retweets}`);
    });
    
    return { username, profile, tweets };
    
  } catch (err) {
    console.error(`Error analyzing @${username}:`, err.message);
    return { username, error: err.message };
  }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Navigate to Twitter home first
  console.log('Opening Twitter...');
  await page.goto('https://x.com', { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Check if logged in
  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector('[data-testid="loginButton"]') === null;
  });
  
  if (!isLoggedIn) {
    console.log('Not logged in. Please login manually...');
    console.log('Press Enter when done login and captured cookies...');
    await new Promise(r => process.stdin.once('data', r));
  }
  
  const results = [];
  for (const kol of KOLS) {
    const result = await analyzeKOL(kol);
    results.push(result);
    await page.waitForTimeout(2000);
  }
  
  await browser.close();
  
  // Summary
  console.log('\n\n=== SUMMARY ===');
  results.forEach(r => {
    console.log(`\n@${r.username}:`);
    if (r.error) {
      console.log(`  Error: ${r.error}`);
    } else {
      console.log(`  Tweets analyzed: ${r.tweets.length}`);
      console.log(`  Bio: ${r.profile.bio.slice(0, 100)}`);
    }
  });
}

main().catch(console.error);