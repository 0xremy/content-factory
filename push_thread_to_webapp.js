const https = require('https');
const fs = require('fs');

const HOST = 'content-factory-68ch.onrender.com';
const PATH = '/api/posts';

const enContent = fs.readFileSync('/home/profesor/.openclaw/workspace/twitter_thread_english.md', 'utf8');
const viContent = fs.readFileSync('/home/profesor/.openclaw/workspace/twitter_thread_vietnamese.md', 'utf8');

function parseThread(text) {
    const posts = [];
    // Split by **Post X**
    const sections = text.split(/\*\*Post \d+\*\*/);
    
    // The first section is usually the intro/header
    for (let i = 1; i < sections.length; i++) {
        const section = sections[i];
        const visualMatch = section.match(/\*\*Visual:\*\*\s*([\s\S]*?)(?=\*\*Text:\*\*|$)/);
        const textMatch = section.match(/\*\*Text:\*\*\s*([\s\S]*?)$/);
        
        if (visualMatch && textMatch) {
            posts.push({
                index: i,
                visual: visualMatch[1].trim(),
                text: textMatch[1].trim()
            });
        }
    }
    return posts;
}

function postRequest(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: HOST,
            path: PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(body));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function push() {
    const enPosts = parseThread(enContent);
    const viPosts = parseThread(viContent);

    console.log(`Parsed ${enPosts.length} English posts and ${viPosts.length} Vietnamese posts.`);

    if (enPosts.length === 0) {
        console.error('Failed to parse any posts. Check file format.');
        process.exit(1);
    }

    for (let i = 0; i < enPosts.length; i++) {
        const payload = {
            title: `Post ${enPosts[i].index} - Visual: ${enPosts[i].visual.substring(0, 50)}...`,
            content_en: enPosts[i].text,
            content_vi: viPosts[i] ? viPosts[i].text : '',
            status: 'reviewed'
        };

        try {
            const res = await postRequest(payload);
            console.log(`Successfully pushed post ${enPosts[i].index}. ID: ${res._id}`);
        } catch (err) {
            console.error(`Failed to push post ${enPosts[i].index}: ${err.message}`);
            if (err.message.includes('401') || err.message.includes('No token')) {
                console.error('API requires authentication. Stopping.');
                process.exit(1);
            }
        }
    }
    console.log('Push complete.');
}

push();
