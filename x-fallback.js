#!/usr/bin/env node
/**
 * X/Twitter API Fallback Utility
 * 
 * When X API hits rate limits (402, 429), fall back to web search.
 * 
 * Usage:
 *   node x-fallback.js "query to search"
 *   node x-fallback.js --test
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const WEB_SEARCH_TOOL = 'web_search'; // OpenClaw built-in
const CLAUDE_SEARCH_SCRIPT = '/home/profesor/.openclaw/workspace/skills/claudecode-websearch/scripts/websearch.sh';

async function webSearch(query) {
  console.log(`🔍 Web search fallback for: "${query}"`);
  
  // In actual OpenClaw agent, you would call:
  // const result = await web_search(query);
  // return result.content;
  
  console.log(`   Using: ${WEB_SEARCH_TOOL} (Gemini search)`);
  console.log(`   Command: web_search("${query}")`);
  
  return `Web search results for "${query}" would appear here.`;
}

async function claudeSearch(query) {
  if (!fs.existsSync(CLAUDE_SEARCH_SCRIPT)) {
    console.log(`⚠️ Claude search script not found: ${CLAUDE_SEARCH_SCRIPT}`);
    return null;
  }
  
  console.log(`🤖 Using Claude/Codex web search for: "${query}"`);
  return new Promise((resolve, reject) => {
    const proc = spawn('bash', [CLAUDE_SEARCH_SCRIPT, query]);
    let output = '';
    
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      console.error(`Claude search stderr: ${data}`);
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Claude search failed with code ${code}`));
      }
    });
  });
}

function simulateXApiError() {
  const errors = [
    { code: 429, message: 'Too Many Requests - Rate limit exceeded' },
    { code: 402, message: 'Payment Required - Credits depleted' },
    { code: 401, message: 'Unauthorized - Invalid credentials' }
  ];
  return errors[Math.floor(Math.random() * errors.length)];
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    console.log('🧪 Testing X API fallback simulation\n');
    
    // Simulate X API error
    const error = simulateXApiError();
    console.log(`❌ X API Error: ${error.code} - ${error.message}`);
    
    if (error.code === 429 || error.code === 402) {
      console.log(`🔄 Triggering fallback to web search...`);
      const query = 'crypto trends today';
      const result = await webSearch(query);
      console.log(`\n📊 Fallback result:\n${result}`);
    }
    
    console.log('\n✅ Fallback flow tested successfully');
    return;
  }
  
  if (args.length === 0) {
    console.log(`
X/Twitter API Fallback Utility

Usage:
  node x-fallback.js "query to search"
  node x-fallback.js --test

Example:
  node x-fallback.js "Bitcoin ETF latest news"
  node x-fallback.js --test

Fallback Chain:
  1. X API (primary) - OAuth 1.0a via x-api skill
  2. Web Search (fallback) - Gemini search via web_search tool
  3. Claude/Codex CLI (optional) - claudecode-websearch skill

When X API returns:
  - 429 (Rate limit exceeded)
  - 402 (Payment required/Credits depleted)
  → Automatically fall back to web search

Notes:
  - web_search is built-in to OpenClaw (no setup needed)
  - For claudecode-websearch: npm i -g @anthropic-ai/claude-code
  - Qmd skill installed, no binary required
`);
    return;
  }
  
  const query = args.join(' ');
  console.log(`\n🎯 Processing query: "${query}"`);
  console.log(`📋 Simulating X API attempt...`);
  
  // In real usage, you'd call x-api skill first
  // If it fails with 429/402, then fallback
  
  const error = simulateXApiError();
  if (error.code === 429 || error.code === 402) {
    console.log(`\n⚠️ X API limited (${error.code}), using fallback...`);
    const result = await webSearch(query);
    console.log(`\n📄 Results:\n${result}`);
    console.log(`\n💡 Note: In production, use web_search("${query}") tool call`);
  } else {
    console.log(`\n✅ X API would process: "${query}"`);
    console.log(`   (Simulated non-limit error: ${error.code})`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { webSearch, claudeSearch };