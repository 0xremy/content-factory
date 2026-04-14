#!/usr/bin/env node
// Post to X using official API (OAuth 1.0a) with optional media
// Credentials: env vars (X_API_KEY, etc.) or ~/.clawdbot/secrets/x-api.json

import { TwitterApi } from 'twitter-api-v2';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Load credentials from env vars or config file
function loadCredentials() {
  // Try environment variables first
  if (process.env.X_API_KEY && process.env.X_ACCESS_TOKEN) {
    return {
      consumerKey: process.env.X_API_KEY,
      consumerSecret: process.env.X_API_SECRET,
      accessToken: process.env.X_ACCESS_TOKEN,
      accessTokenSecret: process.env.X_ACCESS_SECRET,
    };
  }

  // Fall back to config file
  const configPaths = [
    join(homedir(), '.clawdbot', 'secrets', 'x-api.json'),
    join(process.cwd(), '.x-api.json'),
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        return JSON.parse(readFileSync(configPath, 'utf8'));
      } catch (e) {
        console.error(`❌ Failed to parse ${configPath}:`, e.message);
      }
    }
  }

  return null;
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let text = '';
  let imagePath = null;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--image=')) {
      imagePath = arg.substring(8);
    } else if (arg.startsWith('-i=')) {
      imagePath = arg.substring(3);
    } else if (arg === '--image' || arg === '-i') {
      if (i + 1 < args.length) {
        imagePath = args[i + 1];
        i++;
      }
    } else {
      // Add to text with space
      if (text) text += ' ';
      text += arg;
    }
  }
  
  return { text, imagePath };
}

const credentials = loadCredentials();

if (!credentials) {
  console.error(`❌ No credentials found.

Set environment variables:
  export X_API_KEY="..."
  export X_API_SECRET="..."
  export X_ACCESS_TOKEN="..."
  export X_ACCESS_SECRET="..."

Or create ~/.clawdbot/secrets/x-api.json:
  {
    "consumerKey": "...",
    "consumerSecret": "...",
    "accessToken": "...",
    "accessTokenSecret": "..."
  }
`);
  process.exit(1);
}

const client = new TwitterApi({
  appKey: credentials.consumerKey,
  appSecret: credentials.consumerSecret,
  accessToken: credentials.accessToken,
  accessSecret: credentials.accessTokenSecret,
});

const { text, imagePath } = parseArgs();

if (!text && !imagePath) {
  console.error('Usage: x-post <tweet text> [--image <path>]');
  console.error('       x-post <tweet text> [-i <path>]');
  process.exit(1);
}

try {
  let mediaId = null;
  
  // Upload image if provided
  if (imagePath) {
    if (!existsSync(imagePath)) {
      console.error(`❌ Image file not found: ${imagePath}`);
      process.exit(1);
    }
    
    console.log(`📤 Uploading image: ${imagePath}`);
    mediaId = await client.v1.uploadMedia(imagePath);
    console.log(`✅ Image uploaded, media ID: ${mediaId}`);
  }
  
  // Post tweet with or without media
  let tweetData;
  if (mediaId) {
    tweetData = await client.v2.tweet({
      text: text || '', // Tweet can be empty with just image
      media: { media_ids: [mediaId] }
    });
  } else {
    tweetData = await client.v2.tweet(text);
  }
  
  console.log(`✅ Posted: https://x.com/i/status/${tweetData.data.id}`);
  if (imagePath) {
    console.log(`📎 With image: ${imagePath}`);
  }
} catch (err) {
  console.error('❌ Failed:', err.message);
  if (err.data) console.error(JSON.stringify(err.data, null, 2));
  process.exit(1);
}
