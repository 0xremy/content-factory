const https = require('https');

const data = JSON.stringify({
  name: 'x-cms-backend',
  type: 'web_service',
  repo: 'https://github.com/profesor/x-cms',
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
    { key: 'X_ACCESS_TOKEN', value: '1377671664817692674-sNd9KIwpwiCl9wMpWFNh3F34SVhca6' },
    { key: 'X_ACCESS_TOKEN_SECRET', value: '2xsRUahZYPHDXTGtVRTfbNyJykFx9iyf1JXZ8hpBIYAJ5' }
  ]
});

const options = {
  hostname: 'api.render.com',
  path: '/v1/services',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer rnd_mbNzOkinJPi4ftLu7eYlj0BDuT7W',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log('Sending data:', data);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
