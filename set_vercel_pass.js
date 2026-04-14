const https = require('https');

const data = JSON.stringify({
  key: 'DASHBOARD_PASSWORD',
  value: 'Prof3su1!2026',
  type: 'plain',
  target: ['production']
});

const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: '/v9/projects/prj_C08LPYU5aIaFwWHwPs7FXTGe25B3/env',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer vcp_8mQb2k7ixyO2jAR9kD7aiEqFxHWMWcPALfkhiBadqnCe8uQ5sf3kkhgA',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
