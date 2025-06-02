import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export async function POST() {
  try {
    // Create OAuth instance
    const oauth = new OAuth({
      consumer: {
        key: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
        secret: process.env.TWITTER_CLIENT_SECRET!,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });

    // Request token data
    const requestTokenURL = 'https://api.twitter.com/oauth/request_token';
    const callbackURL = process.env.NODE_ENV === 'development' 
      ? 'https://prospect-sports.vercel.app/api/twitter/callback'
      : 'https://prospect-sports.vercel.app/api/twitter/callback';

    const requestData = {
      url: requestTokenURL,
      method: 'POST',
      data: { oauth_callback: callbackURL },
    };

    // Get authorization header
    const authHeader = oauth.toHeader(oauth.authorize(requestData));

    // Make request to Twitter
    const response = await fetch(requestTokenURL, {
      method: 'POST',
      headers: {
        Authorization: authHeader.Authorization,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `oauth_callback=${encodeURIComponent(callbackURL)}`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter request token error:', errorText);
      console.warn('Twitter request callback:', callbackURL);
      console.warn('Twitter request AuthHeader:', authHeader);
      console.warn('Twitter request RequestData:', requestData);
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Twitter response:', responseText);

    // Parse response
    const params = new URLSearchParams(responseText);
    const oauthToken = params.get('oauth_token');
    const oauthTokenSecret = params.get('oauth_token_secret');

    if (!oauthToken || !oauthTokenSecret) {
      throw new Error('Failed to get OAuth tokens from Twitter');
    }

    // Build authorization URL
    const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;

    return NextResponse.json({
      authUrl,
      oauthToken,
      oauthTokenSecret,
    });

  } catch (error) {
    console.error('OAuth 1.0a auth error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate Twitter authentication',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
