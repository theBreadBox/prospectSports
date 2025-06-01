import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const oauthToken = searchParams.get('oauth_token');
  const oauthVerifier = searchParams.get('oauth_verifier');
  
  if (!oauthToken || !oauthVerifier) {
    return NextResponse.redirect(new URL('/?error=missing_oauth_params', request.url));
  }

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

    // Access token request
    const accessTokenURL = 'https://api.twitter.com/oauth/access_token';
    const requestData = {
      url: accessTokenURL,
      method: 'POST',
      data: { 
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
      },
    };

    // Get authorization header (we don't have the token secret here, so we'll use empty string)
    // This is fine for this step as Twitter will validate with the token they provided
    const token = {
      key: oauthToken,
      secret: '', // We don't have this from the callback, but it's OK for this request
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    // Make request to get access token
    const response = await fetch(accessTokenURL, {
      method: 'POST',
      headers: {
        Authorization: authHeader.Authorization,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Access token error:', errorText);
      return NextResponse.redirect(new URL('/?error=access_token_failed', request.url));
    }

    const responseText = await response.text();
    console.log('Access token response:', responseText);

    // Parse access token response
    const params = new URLSearchParams(responseText);
    const accessToken = params.get('oauth_token');
    const accessTokenSecret = params.get('oauth_token_secret');
    const userId = params.get('user_id');
    const screenName = params.get('screen_name');

    if (!accessToken || !accessTokenSecret || !userId || !screenName) {
      console.error('Missing required parameters from access token response');
      return NextResponse.redirect(new URL('/?error=incomplete_token_response', request.url));
    }

    // Redirect back to home page with Twitter success and user data
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('twitter_success', 'true');
    redirectUrl.searchParams.set('twitter_username', screenName);
    redirectUrl.searchParams.set('twitter_id', userId);
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Twitter OAuth 1.0a callback error:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
} 