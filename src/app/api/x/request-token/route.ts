import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export async function POST() {
  console.log('Request token endpoint hit'); // Debug log

  const callback_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/x/callback`.replace('//', '/');
  console.log('Callback URL:', callback_url); // Add this log

  const oauth = new OAuth({
    consumer: {
      key: process.env.NEXT_PUBLIC_X_CONSUMER_KEY!,
      secret: process.env.X_CONSUMER_SECRET!
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
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST',
    data: {
      oauth_callback: callback_url
    }
  };

  try {
    console.log('Making request to Twitter API'); // Debug log
    const headers = oauth.toHeader(oauth.authorize(request_data));
    console.log('OAuth headers:', headers); // Debug log

    const response = await fetch(request_data.url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Twitter API error:', error); // Debug log
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.text();
    console.log('Twitter API response:', data); // Debug log
    
    const parsed = new URLSearchParams(data);
    return NextResponse.json({
      oauth_token: parsed.get('oauth_token'),
      oauth_token_secret: parsed.get('oauth_token_secret')
    });
  } catch (error) {
    console.error('Error getting request token:', error);
    return NextResponse.json({ error: 'Failed to get request token' }, { status: 500 });
  }
} 