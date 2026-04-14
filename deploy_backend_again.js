const https = require('https');
const fs = require('fs');

const data = JSON.stringify({
  name: 'x-cms-backend-final',
  type: 'web_service',
  repo: 'https://github.com/empty-org/x-cms',
  ownerId: 'tea-d7eao01o3t8c73cr2hfg',
  serviceDetails: {
    runtime: 'node',
    buildCommand: 'npm install',
    startCommand: 'node server.js'
  },
  envVars: [
    { key: 'MONGODB_URI', value: 'mongodb+srv://remy12558_db_user:7UymPwodnvryZ9vZ@content-factory.kozprjg.mongodb.net/?appName=content-factory' },
    { key: 'X_CONSUMER_KEY', value: 'JuTZyR7XXQihNaGFLzlotIKFm' },
    { key: 'X_CONSUMER_SECRET', value: 'QN5zD6NPeVACOccu6esoWeBRxkQzHECW3D5ylO3sqWI00P5Umg' },
    { key: 'X_ACCESS_TOKEN', value: '137671664817692674-sNd9KIwpwiCl9wMpWFNh3F34SVhca6' },
    { key: 'X_ACCESS_TOKEN_SECRET', value: '2xsRUahZYPHDXTGtVRTfbNyJykFx9iyf1JXZ8hpBIYAJ5' }
  ]
});

const options = {
  hostname: 'api.render.com',
  port: 443,
  path: '/v1/services',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer rnd_',
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
