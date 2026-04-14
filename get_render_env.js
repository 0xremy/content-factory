const https = require('https');

const options = {
  hostname: 'api.render.com',
  path: '/v1/environments/evm-d7eb8t7avr4c73ejovfg',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer rnd_mbNzOkinJPi4ftLu7eYlj0BDuT7W',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(body), null, 2));
  });
});

req.on('error', (e) => console.error(e));
req.end();
