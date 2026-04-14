const https = require('https');

const TOKEN = 'vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA';
const PROJECT_ID = 'prj_Cv7kf4lahRhv4AXlUcIheRwc4kDm';

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      method: options.method || 'GET',
      ...options
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function triggerDeploy() {
  try {
    console.log('Triggering redeploy...');
    const deployment = await request(`https://api.vercel.com/v13/deployments`, {
      method: 'POST',
      body: {
        projectId: PROJECT_ID,
        name: 'auth-update'
      }
    });
    console.log('Deployment response:', JSON.stringify(deployment.data, null, 2));
    console.log('URL:', deployment.data.url);
  } catch (e) {
    console.error('Deployment failed:', e);
  }
}

triggerDeploy();
