import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

// Twitter OAuth configuration
export const twitterConfig = {
  callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/callback`,
  requestTokenUrl: 'https://api.twitter.com/oauth/request_token',
  accessTokenUrl: 'https://api.twitter.com/oauth/access_token',
  authorizeUrl: 'https://api.twitter.com/oauth/authorize',
  consumer: {
    key: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
    secret: process.env.TWITTER_CLIENT_SECRET!
  }
};

// OAuth 1.0a helper
export const createOAuthInstance = () => {
  return new OAuth({
    consumer: twitterConfig.consumer,
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto
        .createHmac('sha1', key)
        .update(base_string)
        .digest('base64');
    },
  });
}; 