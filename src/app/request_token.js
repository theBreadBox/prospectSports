import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const oauth = new OAuth({
    consumer: {
      key: process.env.X_CONSUMER_KEY,
      secret: process.env.X_CONSUMER_SECRET
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64');
    },
  });

  const request_data = {
    url: 'https://api.x.com/oauth/request_token',
    method: 'POST',
    data: {
      oauth_callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/x/callback`
    }
  };

  try {
    const response = await fetch(request_data.url, {
      method: request_data.method,
      headers: {
        ...oauth.toHeader(oauth.authorize(request_data)),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.text();
    const parsed = new URLSearchParams(data);
    
    res.status(200).json({
      oauth_token: parsed.get('oauth_token'),
      oauth_token_secret: parsed.get('oauth_token_secret')
    });
  } catch (error) {
    console.error('Error getting request token:', error);
    res.status(500).json({ message: 'Error getting request token' });
  }
}