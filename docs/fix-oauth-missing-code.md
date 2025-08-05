# Fix for OAuth Missing Code Parameter

## Problem
The OAuth callback is returning to `http://localhost:3001/auth/callback` without the authorization code parameter. This happens when Supabase is not properly configured to pass the OAuth code back to your application.

## Root Cause
Supabase is redirecting back to your app after OAuth, but it's not including the authorization code in the URL. This typically happens when:
1. The Supabase project doesn't have Google OAuth properly configured
2. The redirect URL pattern doesn't match what Supabase expects

## Solution

### Step 1: Configure Google OAuth in Supabase

1. Go to [Supabase Authentication Providers](https://app.supabase.com/project/yklrjzlidixjlbhppltf/auth/providers)
2. Find **Google** in the list
3. Click to enable it
4. Add your Google OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console
5. **IMPORTANT**: Click "Save" to apply the changes

### Step 2: Get Google OAuth Credentials (if you don't have them)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Enable it
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add these Authorized redirect URIs:
     ```
     https://yklrjzlidixjlbhppltf.supabase.co/auth/v1/callback
     ```
   - Copy the Client ID and Client Secret

### Step 3: Update Supabase URL Configuration

1. Go to [Supabase URL Configuration](https://app.supabase.com/project/yklrjzlidixjlbhppltf/auth/url-configuration)
2. Set **Site URL**: `http://localhost:3001`
3. Add to **Redirect URLs**:
   ```
   http://localhost:3001/**
   ```

### Step 4: Test the Fix

1. Clear all browser cookies and storage
2. Restart your dev server
3. Try signing in with Google again

## Why This Happens

When Supabase doesn't have the Google OAuth provider properly configured, it can't complete the OAuth flow. The sequence should be:

1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. User authenticates
4. Google redirects to Supabase with code
5. **Supabase processes the code** (this is failing)
6. Supabase redirects to your app with the code

Without Google OAuth credentials in Supabase, step 5 fails and Supabase redirects back without a code.

## Quick Verification

To verify Google OAuth is enabled in Supabase, you can check if the OAuth URL works:
```
https://yklrjzlidixjlbhppltf.supabase.co/auth/v1/authorize?provider=google
```

If it returns an error, Google OAuth is not configured.