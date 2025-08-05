# Quick Google OAuth Setup

## Step 1: Enable Google Provider in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com/project/yklrjzlidixjlbhppltf
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON** (enable it)
5. You'll see two empty fields:
   - Google Client ID
   - Google Client Secret

## Step 2: Get Google OAuth Credentials

### Option A: Quick Setup (Development Only)
1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. If prompted to configure consent screen:
   - Choose **External**
   - Fill required fields (app name, email)
   - Add your email to test users
   - Save and continue through all steps
6. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **Livrili Dev**
   - Authorized redirect URIs, add:
     ```
     https://yklrjzlidixjlbhppltf.supabase.co/auth/v1/callback
     ```
   - Click **Create**
7. Copy the credentials shown:
   - Client ID (looks like: xxx.apps.googleusercontent.com)
   - Client Secret

### Option B: Use Test Credentials (Temporary)
If you want to test quickly, you can use these test credentials:
- **Client ID**: `YOUR_GOOGLE_CLIENT_ID`
- **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`

(Note: Replace with actual credentials from Google Console)

## Step 3: Configure Supabase

1. Go back to Supabase Dashboard
2. In the Google provider settings, paste:
   - **Client ID**: (from Google)
   - **Client Secret**: (from Google)
3. Click **Save**

## Step 4: Test It

1. Open your app: http://localhost:3002/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to complete your profile

## Troubleshooting

### "Failed to sign in with Google"
This usually means:
1. Google provider is not enabled in Supabase
2. Client ID/Secret are incorrect
3. Redirect URI doesn't match

### "Redirect URI mismatch"
Make sure you added exactly this URI in Google Console:
```
https://yklrjzlidixjlbhppltf.supabase.co/auth/v1/callback
```

### Still Not Working?
1. Check browser console for errors (F12)
2. Verify in Supabase Dashboard:
   - Authentication → Providers → Google is enabled
   - Client ID and Secret are saved
3. Try in incognito/private browsing mode

## Making Yourself Admin

Since you already created a Google user, run this SQL to make yourself admin:

```sql
-- First, find your user ID
SELECT id, email, raw_user_meta_data->>'full_name' as name 
FROM auth.users 
WHERE email = 'your-google-email@gmail.com';

-- Then update your role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-google-email@gmail.com';
```

## Next Steps

After Google sign-in works:
1. Complete your profile (username required)
2. Access admin portal at http://localhost:3001
3. Start adding products and categories