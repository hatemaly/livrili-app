# Google OAuth Setup for Livrili

This guide explains how to configure Google OAuth authentication in Supabase for the Livrili app.

## Prerequisites

- Supabase project (already created)
- Google Cloud Console account
- Admin access to both

## Step 1: Configure Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" user type
     - Fill in the required fields (app name, support email, etc.)
     - Add your domain to authorized domains
     - Save and continue

5. Create OAuth client ID:
   - Application type: "Web application"
   - Name: "Livrili App"
   - Authorized redirect URIs:
     ```
     https://yklrjzlidixjlbhppltf.supabase.co/auth/v1/callback
     ```
   - Click "Create"

6. Save your credentials:
   - Client ID: `your-google-client-id`
   - Client Secret: `your-google-client-secret`

## Step 2: Configure Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/project/yklrjzlidixjlbhppltf)
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list and click to expand
4. Enable Google provider
5. Enter your Google OAuth credentials:
   - Client ID: `your-google-client-id`
   - Client Secret: `your-google-client-secret`
6. Click "Save"

## Step 3: Update Redirect URLs (Production)

For production deployment, you'll need to add your production URLs to Google OAuth:

1. In Google Cloud Console, go to your OAuth 2.0 client
2. Add these redirect URIs:
   ```
   https://your-domain.com/auth/callback
   https://admin.your-domain.com/auth/callback
   ```

## Step 4: Test the Integration

1. Start your development servers:
   ```bash
   npm run dev
   ```

2. Navigate to either portal:
   - Admin Portal: http://localhost:3001/login
   - Retail Portal: http://localhost:3002/login

3. Click "Continue with Google"
4. Sign in with your Google account
5. First-time users will be redirected to complete their profile

## How It Works

### Database Schema

The migration `002_oauth_support.sql` adds:
- `auth_provider` column to track authentication method
- `oauth_profile` JSONB column to store Google profile data
- `email` column for OAuth users
- Makes `username` nullable for OAuth users

### Authentication Flow

1. User clicks "Continue with Google"
2. Redirected to Google for authentication
3. Google redirects back to `/auth/callback`
4. Supabase creates/updates user in `auth.users`
5. Database trigger creates/updates user profile in `public.users`
6. First-time users redirected to `/auth/complete-profile`
7. Existing users redirected to `/dashboard`

### Admin Portal Specifics

- Only users with `role = 'admin'` can access admin portal
- Non-admin Google users are automatically signed out
- Error message displayed for unauthorized access

### User Profile Completion

First-time OAuth users must complete their profile with:
- Unique username (required)
- Business name (optional - creates retailer account)
- Phone number (optional)

## Security Considerations

1. **Client ID**: Safe to expose in frontend code
2. **Client Secret**: Keep secure, never expose in frontend
3. **Redirect URLs**: Must be explicitly whitelisted in Google Console
4. **Role-based Access**: Admin portal checks user role after OAuth
5. **Session Management**: Handled by Supabase Auth

## Troubleshooting

### Common Issues

1. **"Failed to sign in with Google"**
   - Check Google OAuth is enabled in Supabase
   - Verify client ID and secret are correct
   - Ensure redirect URLs match exactly

2. **"Access denied. Admin accounts only"**
   - User signed in but doesn't have admin role
   - Update user role in database if needed

3. **Redirect URI mismatch**
   - Add exact redirect URL to Google Console
   - Include protocol (http/https) and port

4. **Profile completion loop**
   - Check database trigger is created
   - Verify RLS policies allow user updates

## Next Steps

1. Configure additional OAuth providers (GitHub, Microsoft)
2. Implement social account linking
3. Add email verification for OAuth users
4. Set up custom domain for OAuth redirects