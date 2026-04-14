const https = require('https');
const TOKEN = 'vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA';

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
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function test() {
  console.log('Testing minimal deployment...');
  const res = await request('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    body: {
      name: 'test-deploy',
      files: [{ file: 'index.html', data: '<h1>Hello</h1>' }]
    }
  });
  console.log('Response:', JSON.stringify(res.data, null, 2));
}
test();
