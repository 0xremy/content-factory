const fs = require('fs');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanupAndPush() {
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

    console.log('Cleaning up existing posts...');
    try {
        const response = await fetch(apiUrl);
        const existingPosts = await response.json();
        const postList = Array.isArray(existingPosts) ? existingPosts : (existingPosts.data || []);
        
        console.log(`Found ${postList.length} posts to delete.`);
        for (const p of postList) {
            await fetch(`${apiUrl}/${p._id}`, { method: 'DELETE' });
            console.log(`Deleted ${p._id}`);
        }
    } catch (err) {
        console.error('Cleanup error:', err.message);
    }

    console.log('\nPushing corrected posts...');
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const payload = {
            ...post,
            content: post.content_en ? [post.content_en] : (post.content || []),
        };

        try {
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
            console.error(`Post ${i + 1}/${posts.length}: Network error: ${err.message}.`);
            failureCount++;
        }
    }

    console.log('\n--- Final Summary ---');
    console.log(`Total: ${posts.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failure: ${failureCount}`);
}

cleanupAndPush();
