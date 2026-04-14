const fs = require('fs');

async function pushPosts() {
    const filePath = '/home/profesor/.openclaw/workspace/posts_import.json';
    const apiUrl = 'https://content-factory-68ch.onrender.com/api/posts';
    
    let posts;
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        posts = JSON.parse(data);
    } catch (err) {
        console.error('Error reading or parsing JSON file:', err);
        process.exit(1);
    }

    if (!Array.isArray(posts)) {
        console.error('Expected an array of posts in JSON file.');
        process.exit(1);
    }

    console.log(`Found ${posts.length} posts to upload.`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        try {
            const payload = {
                title: post.title,
                content: [post.content_en, post.content_vi].filter(Boolean),
                status: 'draft',
                visual_suggestion: post.visual_suggestion,
                angle: post.angle
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log(`Post ${i + 1}/${posts.length}: Successfully pushed.`);
                successCount++;
            } else {
                console.error(`Post ${i + 1}/${posts.length}: Failed with status ${response.status}.`);
                failureCount++;
            }
        } catch (err) {
            console.error(`Post ${i + 1}/${posts.length}: Network error: ${err.message}`);
            failureCount++;
        }
    }

    console.log('\n--- Push Summary ---');
    console.log(`Total: ${posts.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failure: ${failureCount}`);

    try {
        console.log('\nVerifying server count...');
        const verifyResp = await fetch(apiUrl);
        if (verifyResp.ok) {
            const serverPosts = await verifyResp.json();
            const count = Array.isArray(serverPosts) ? serverPosts.length : 0;
            console.log(`Server currently has ${count} posts.`);
        } else {
            console.log('Could not verify server count.');
        }
    } catch (err) {
        console.log('Verification error:', err.message);
    }
}

pushPosts();
