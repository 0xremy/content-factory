const fs = require('fs');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
        let attempts = 0;
        const maxAttempts = 5;
        let pushed = false;

        while (attempts < maxAttempts && !pushed) {
            try {
                const payload = {
                    ...post,
                    content: post.content_en ? [post.content_en] : (post.content || []),
                };

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log(`Post ${i + 1}/${posts.length}: Successfully pushed.`);
                    successCount++;
                    pushed = true;
                } else if (response.status === 429 || response.status >= 500) {
                    attempts++;
                    const delay = Math.pow(2, attempts) * 1000;
                    console.warn(`Post ${i + 1}/${posts.length}: Server error ${response.status}. Retrying in ${delay}ms... (Attempt ${attempts}/${maxAttempts})`);
                    await sleep(delay);
                } else {
                    console.error(`Post ${i + 1}/${posts.length}: Failed with status ${response.status}. Skipping.`);
                    failureCount++;
                    break; 
                }
            } catch (err) {
                attempts++;
                const delay = Math.pow(2, attempts) * 1000;
                console.error(`Post ${i + 1}/${posts.length}: Network error: ${err.message}. Retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }

        if (!pushed && attempts >= maxAttempts) {
            console.error(`Post ${i + 1}/${posts.length}: Max retries reached. Failed.`);
            failureCount++;
        }
    }

    console.log('\n--- Push Summary ---');
    console.log(`Total: ${posts.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failure: ${failureCount}`);

    // Verification step
    try {
        console.log('\nVerifying server count...');
        const verifyResp = await fetch(apiUrl);
        if (verifyResp.ok) {
            const serverPosts = await verifyResp.json();
            const count = Array.isArray(serverPosts) ? serverPosts.length : 0;
            console.log(`Server currently has ${count} posts.`);
        } else {
            console.log('Could not verify server count (GET request failed).');
        }
    } catch (err) {
        console.log('Verification network error:', err.message);
    }
}

pushPosts();
