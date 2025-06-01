# Twitter OAuth 1.0a Integration

This implementation uses OAuth 1.0a for Twitter authentication, which is more reliable and has better compatibility with browser extensions.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Twitter OAuth 1.0a Credentials
NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_api_key_here
TWITTER_CLIENT_SECRET=your_twitter_api_secret_here
```

**Note:** For OAuth 1.0a, use your Twitter app's **API Key** as the client ID and **API Secret Key** as the client secret.

## Twitter App Configuration

1. **Go to Twitter Developer Portal**: https://developer.twitter.com/en/portal/dashboard
2. **Create or select your app**
3. **App Settings → Authentication settings**:
   - **App permissions**: Read
   - **Type of App**: Web App, Automated App or Bot
   - **Callback URI**: 
     - Development: `http://localhost:3000/api/twitter/callback`
     - Production: `https://www.prospectsports.xyz/api/twitter/callback`

4. **Keys and Tokens**:
   - Copy **API Key** → use as `NEXT_PUBLIC_TWITTER_CLIENT_ID`
   - Copy **API Secret Key** → use as `TWITTER_CLIENT_SECRET`

## Implementation Features

- **OAuth 1.0a flow** for better browser compatibility
- **CSRF protection** via OAuth verifier
- **Automatic user data extraction** (username, user ID)
- **Error handling** with user-friendly messages
- **Debug logging** for troubleshooting

## User Flow

1. User clicks "Sign in with Twitter" button
2. App calls `/api/twitter/auth` to get authorization URL
3. User is redirected to Twitter for authorization
4. Twitter redirects back to `/api/twitter/callback` with tokens
5. App extracts user data and redirects to home page with success parameters
6. Frontend processes the success parameters and updates UI

## Security Features

- Server-side credential handling
- OAuth 1.0a signature verification
- No sensitive data stored in browser
- Proper error handling and user feedback

## Troubleshooting

- **"Twitter Not Configured"**: Missing environment variables
- **500 errors**: Check Twitter app configuration and credentials
- **Callback errors**: Verify callback URL matches exactly in Twitter app settings 