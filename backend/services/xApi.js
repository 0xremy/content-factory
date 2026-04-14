const crypto = require('crypto');
const https = require('https');

const consumerKey = process.env.X_CONSUMER_KEY;
const consumerSecret = process.env.X_CONSUMER_SECRET;
const accessToken = process.env.X_ACCESS_TOKEN;
const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

function encode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function generateOAuthHeader(method, url, params = {}) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
    ...params,
  };

  const sortedParams = Object.keys(oauthParams)
    .sort()
    .map((key) => `${encode(key)}=${encode(oauthParams[key])}`)
    .join('&');

  const baseString = `${method.toUpperCase()}\n${encode(url)}\n${encode(sortedParams)}`;
  const signingKey = `${encode(consumerSecret)}&${encode(accessTokenSecret)}`;
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  oauthParams.oauth_signature = signature;

  const headerParams = Object.keys(oauthParams)
    .sort()
    .map((key) => `${encode(key)}="${encode(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${headerParams}`;
}

async function getTweetMetrics(tweetId) {
  const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`;
  const method = 'GET';

  const authHeader = generateOAuthHeader(method, url);

  const options = {
    hostname: 'api.twitter.com',
    path: `/2/tweets/${tweetId}?tweet.fields=public_metrics`,
    method: method,
    headers: {
      'Authorization': authHeader,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response.data);
          } else {
            reject({
              status: res.statusCode,
              data: response,
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

function postTweet(status) {
  // Placeholder implementation – you can replace this with the actual Twitter POST endpoint.
  // For now we simply reject to indicate it is not implemented.
  return Promise.reject(new Error('postTweet function is not implemented yet.'));
}

module.exports = { postTweet, getTweetMetrics };
