# Fix Google OAuth Redirect Issue

## Problem
Getting "Something went wrong during sign in. Please try again." error when trying to sign in with Google.

## Root Cause
The OAuth redirect URI must be properly configured in both Google Cloud Console and your local environment.

## Solution

### 1. Verify Google Cloud Console Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Ensure these redirect URIs are added:
   ```
   http://localhost:3001/auth/callback
   http://localhost:3002/auth/callback
   https://yklrjzlidixjlbhppltf.supabase.co/auth/v1/callback
   ```

### 2. Check Supabase Dashboard Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com/project/yklrjzlidixjlbhppltf)
2. Navigate to "Authentication" > "URL Configuration"
3. Ensure "Site URL" is set to: `http://localhost:3001`
4. Add to "Redirect URLs":
   ```
   http://localhost:3001/auth/callback
   http://localhost:3002/auth/callback
   ```

### 3. Verify Environment Variables

Check your `.env.local` file has the correct values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yklrjzlidixjlbhppltf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test the Fix

1. Clear your browser cookies for localhost
2. Restart the development server:
   ```bash
   npm run dev
   ```
3. Go to http://localhost:3001/login
4. Click "Continue with Google"
5. Complete the Google sign-in flow

## How the OAuth Flow Works

1. User clicks "Continue with Google"
2. App calls `signInWithGoogle()` which uses Supabase's OAuth
3. User is redirected to Google for authentication
4. Google redirects to Supabase's callback URL
5. Supabase processes the OAuth response and creates a session
6. Supabase redirects to your app's `/auth/callback` with a code
7. Your app exchanges the code for a session
8. User is redirected to the dashboard (or profile completion)

## Common Issues

### "Redirect URI mismatch" Error
- The redirect URI in Google Console must match EXACTLY
- Include the protocol (http/https) and port number
- No trailing slashes

### "Failed to exchange code for session"
- Usually means the code has expired or was already used
- Try clearing cookies and signing in again

### User stuck in redirect loop
- Check that the auth callback route properly handles the code
- Ensure cookies are being set correctly
- Verify the user has proper role permissions

## Additional Notes

- For production, update redirect URIs to use HTTPS and your domain
- The `prompt: 'consent'` ensures users can choose their Google account
- The `access_type: 'offline'` allows refresh tokens for long-lived sessions