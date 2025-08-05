# Complete Fix for Google OAuth "callback_error"

## Problem
Getting "Something went wrong during sign in. Please try again." error after Google OAuth redirects back to the application. The OAuth flow completes with Google and Supabase, but fails when returning to the local application.

## Root Cause
The issue occurs when Supabase tries to redirect back to your local application after processing the OAuth callback. The state parameter shows the correct referrer (`http://localhost:3001/auth/callback`), but the redirect is not completing properly.

## Solution Steps

### 1. Update Supabase Redirect URLs

Go to [Supabase Authentication Settings](https://app.supabase.com/project/yklrjzlidixjlbhppltf/auth/url-configuration) and ensure:

**Site URL**: 
```
http://localhost:3001
```

**Redirect URLs** (add ALL of these):
```
http://localhost:3001/**
http://localhost:3001/auth/callback
http://localhost:3002/**
http://localhost:3002/auth/callback
```

The wildcard `/**` is important as it allows Supabase to redirect to any path in your application.

### 2. Clear Browser Data

1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Clear Storage:
   - Local Storage
   - Session Storage  
   - Cookies (especially for localhost and supabase.co)
4. Or simply test in an Incognito window

### 3. Update the OAuth Hook (Optional Enhancement)

If the issue persists, update the signInWithGoogle function to be more explicit about the redirect:

```typescript
// In packages/auth/src/hooks.ts
const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3001/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        // Add this to ensure proper flow
        flowType: 'pkce',
      },
    })
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
```

### 4. Check CORS and Security Headers

Sometimes local development can have CORS issues. Add these headers to your Next.js config:

```typescript
// In apps/admin-portal/next.config.ts
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/auth/callback',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}
```

### 5. Test the Complete Flow

1. Stop the development server
2. Clear all browser data for localhost
3. Run: `npm run dev`
4. Navigate to http://localhost:3001/login
5. Click "Continue with Google"
6. Complete Google sign-in
7. Check browser console and terminal for any error logs

## Debug Information

From your network logs, the OAuth flow is:
1. ✅ User clicks Google sign-in
2. ✅ Redirects to Google OAuth
3. ✅ User authenticates with Google
4. ✅ Google redirects to Supabase with code
5. ✅ Supabase processes the OAuth callback
6. ❌ Supabase redirect back to localhost fails

## Alternative Solution

If the above doesn't work, try using the Supabase Auth UI component which handles the OAuth flow more reliably:

```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

Then use the pre-built component:

```tsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@livrili/database'

export default function LoginPage() {
  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={['google']}
      redirectTo="http://localhost:3001/auth/callback"
    />
  )
}
```

## Common Issues

1. **Wildcard redirect URL not set**: Supabase needs `http://localhost:3001/**` in redirect URLs
2. **Browser blocking third-party cookies**: Try Chrome with third-party cookies enabled
3. **Ad blockers**: Disable ad blockers temporarily
4. **Supabase session cookies**: Clear all supabase.co cookies

## Final Check

Run this command to verify your Supabase project settings:

```bash
npx supabase status
```

This will show your project's configuration and help identify any misconfigurations.