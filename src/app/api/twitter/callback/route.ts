import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  // Verify state parameter
  const savedState = sessionStorage.getItem('twitter_oauth_state');
  if (!state || state !== savedState) {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code: code!,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TWITTER_REDIRECT_URI!,
      }),
    });

    const { access_token } = await tokenResponse.json();

    // Get user details
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { data: userData } = await userResponse.json();

    // Update user record with Twitter info
    await prisma.user.update({
      where: { email: sessionStorage.getItem('current_email') },
      data: {
        twitter_username: userData.username,
        twitter_id: userData.id,
        access_token,
      },
    });

    // Store completion state in session
    sessionStorage.setItem('twitter_step_completed', 'true');
    // Keep the current step
    sessionStorage.setItem('current_step', '3');

    return NextResponse.redirect(new URL('/community', request.url));
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
} 