const fs = require('fs');
const { execSync } = require('child_process');

const enFile = '/home/profesor/.openclaw/workspace/twitter_thread_english.md';
const viFile = '/home/profesor/.openclaw/workspace/twitter_thread_vietnamese.md';
const API_URL = 'https://content-factory-68ch.onrender.com/api/posts';

function parsePosts(content) {
    const posts = [];
    // Flexible regex: optional space after labels, and allows colon or dot for Text
    const postRegex = /\*\*Post (\d+)\*\*\s+\*\*Visual:\*\*\s*([\s\S]*?)\s+\*\*Text[:.]\*\*\s*([\s\S]*?)(?=\n\*\*Post \d+\*\*|\n\n##|$)/g;
    let match;
    while ((match = postRegex.exec(content)) !== null) {
        posts.push({
            id: parseInt(match[1]),
            visual: match[2].trim(),
            text: match[3].trim()
        });
    }
    return posts;
}

const enContent = fs.readFileSync(enFile, 'utf8');
const viContent = fs.readFileSync(viFile, 'utf8');

const enPosts = parsePosts(enContent);
const viPosts = parsePosts(viContent);

console.log(`Parsed ${enPosts.length} English posts and ${viPosts.length} Vietnamese posts.`);

// IDs we already pushed: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14
const pushedIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14];
let newSuccessCount = 0;

for (let i = 0; i < enPosts.length; i++) {
    const enPost = enPosts[i];
    const viPost = viPosts.find(p => p.id === enPost.id);
    
    if (viPost && !pushedIds.includes(enPost.id)) {
        const payload = {
            content_en: enPost.text,
            content_vi: viPost.text,
            visual_suggestion: enPost.visual,
            status: 'reviewed'
        };

        const jsonData = JSON.stringify(payload);
        const safeJson = jsonData.replace(/'/g, "'\\''");
        
        try {
            const cmd = `curl -X POST "${API_URL}" -H "Content-Type: application/json" -d '${safeJson}'`;
            execSync(cmd);
            newSuccessCount++;
            console.log(`Post ${enPost.id}: Success`);
        } catch (error) {
            console.error(`Post ${enPost.id}: Failed`, error.message);
        }
    }
}

console.log(`\nNewly pushed posts: ${newSuccessCount}`);
console.log(`Total successfully pushed posts: ${pushedIds.length + newSuccessCount}`);
