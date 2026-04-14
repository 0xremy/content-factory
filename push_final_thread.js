const https = require('https');
const fs = require('fs');

const API_BASE = 'https://content-factory-68ch.onrender.com';
const DASHBOARD_PASSWORD = 'Profesui_Secure_2026!';

async function request(options, data = null, retries = 3) {
  let lastRes;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            try {
              resolve({
                statusCode: res.statusCode,
                data: JSON.parse(body),
              });
            } catch (e) {
              resolve({
                statusCode: res.statusCode,
                data: body,
              });
            }
          });
        });
        req.on('error', reject);
        if (data) {
          req.write(JSON.stringify(data));
        }
        req.end();
      });

      if (res.statusCode === 502 || res.statusCode === 503 || res.statusCode === 504) {
        console.log(`  ⚠️ Server error ${res.statusCode}, retrying (${i + 1}/${retries})...`);
        lastRes = res;
        await new Promise(r => setTimeout(r, 5000 * (i + 1)));
        continue;
      }

      return res;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`  ⚠️ Request failed, retrying (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, 5000 * (i + 1)));
    }
  }
  throw new Error(`Request failed after ${retries} attempts. Last status: ${lastRes?.statusCode || 'Unknown'}`);
}

function parseThread(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const posts = [];
  const postBlocks = content.split(/\*\*Post \d+\*\*/).slice(1);

  for (const block of postBlocks) {
    const visualMatch = block.match(/\*\*Visual:\*\*\s*(.*?)\n/);
    const textMatch = block.match(/\*\*Text:\*\*\s*([\s\S]*?)(?=\n\*\*Post|\n##|$)/);
    
    posts.push({
      visual: visualMatch ? visualMatch[1].trim() : 'No visual suggestion',
      text: textMatch ? textMatch[1].trim() : '',
    });
  }
  return posts;
}

async function main() {
  try {
    console.log('🔐 Authenticating...');
    const authRes = await request({
      hostname: 'content-factory-68ch.onrender.com',
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { password: DASHBOARD_PASSWORD });

    if (authRes.statusCode !== 200 || !authRes.data.token) {
      throw new Error(`Auth failed: ${JSON.stringify(authRes.data)}`);
    }

    const token = authRes.data.token;
    console.log('✅ Authenticated. Token acquired.');

    const enPosts = parseThread('/home/profesor/.openclaw/workspace/twitter_thread_english.md');
    const viPosts = parseThread('/home/profesor/.openclaw/workspace/twitter_thread_vietnamese.md');

    console.log(`📦 Found ${enPosts.length} English posts and ${viPosts.length} Vietnamese posts.`);

    for (let i = 0; i < enPosts.length; i++) {
      const en = enPosts[i];
      const vi = viPosts[i] || { visual: '', text: 'Missing translation' };

      // Each element in the array must be < 280 chars.
      // English and Vietnamese are separate elements.
      const contentArray = [en.text, vi.text];
      const title = `Post ${i + 1} - Visual: ${en.visual}`;

      console.log(`🚀 Pushing Post ${i + 1}...`);
      const pushRes = await request({
        hostname: 'content-factory-68ch.onrender.com',
        path: '/api/posts/ingest',
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }, { 
        title, 
        content: contentArray,
        tags: ['UAE', 'Crypto', 'Geopolitics']
      });

      if (pushRes.statusCode === 201) {
        console.log(`   ✅ Success: ${pushRes.data.data._id}`);
      } else {
        console.error(`   ❌ Failed: ${pushRes.statusCode} - ${JSON.stringify(pushRes.data)}`);
      }
    }

    console.log('\n✨ All posts processed.');

  } catch (error) {
    console.error('\n💥 Fatal Error:', error.message);
    process.exit(1);
  }
}

main();
