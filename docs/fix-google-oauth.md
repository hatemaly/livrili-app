# Fix Google OAuth Issues

## The Problem
When clicking "Continue with Google", you get redirected back but see "Failed to sign in with Google".

## Solution 1: Configure Site URL in Supabase

1. Go to: https://app.supabase.com/project/yklrjzlidixjlbhppltf/auth/url-configuration
2. Set these URLs:
   - **Site URL**: `http://localhost:3002`
   - **Redirect URLs**: Add these (one per line):
     ```
     http://localhost:3001/auth/callback
     http://localhost:3002/auth/callback
     ```
3. Click **Save**

## Solution 2: Update Redirect URL in Code

The issue might be the redirect URL. Let's update it to use the Supabase auth helpers:

1. First, install the Supabase auth helpers:
   ```bash
   cd apps/retail-portal
   npm install @supabase/auth-helpers-nextjs
   ```

2. Create a route handler for auth callback at `/app/auth/callback/route.ts`:
   ```typescript
   import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
   import { cookies } from 'next/headers'
   import { NextResponse } from 'next/server'

   export async function GET(request: Request) {
     const requestUrl = new URL(request.url)
     const code = requestUrl.searchParams.get('code')

     if (code) {
       const cookieStore = cookies()
       const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
       await supabase.auth.exchangeCodeForSession(code)
     }

     // URL to redirect to after sign in process completes
     return NextResponse.redirect(requestUrl.origin)
   }
   ```

## Solution 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try signing in with Google
4. Look for the callback request
5. Check if there's an error in the response

## Solution 4: Test with Direct Supabase URL

Try this URL directly in your browser:
```
https://yklrjzlidixjlbhppltf.supabase.co/auth/v1/authorize?provider=google
```

If this works, the issue is with the redirect configuration.

## Common Issues

### "Redirect URL mismatch"
- The redirect URL in Google Console must match exactly
- Check for trailing slashes, http vs https, port numbers

### "Invalid request"
- Clear browser cookies
- Try in incognito mode
- Check if Google account has restrictions

### "User already registered"
- Check if the user already exists in auth.users table
- The trigger might be failing to create the user profile

## Debug SQL Queries

Run these to check what's happening:

```sql
-- Check if OAuth user was created
SELECT id, email, created_at, last_sign_in_at, raw_user_meta_data
FROM auth.users
WHERE email = 'your-email@gmail.com';

-- Check if profile was created
SELECT *
FROM users
WHERE email = 'your-email@gmail.com';

-- Check for trigger errors
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## Alternative: Manual Testing

1. Sign in with Google directly on Supabase:
   ```javascript
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: 'http://localhost:3002/auth/callback'
     }
   })
   console.log('OAuth response:', { data, error })
   ```

2. Check the actual redirect URL being used:
   - Open Network tab
   - Look for the Google OAuth request
   - Check the `redirect_uri` parameter