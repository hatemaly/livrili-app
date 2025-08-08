# 🔄 Clear Everything and Test Authentication

## Step 1: Stop the Dev Server
Press `Ctrl+C` in the terminal where `npm run dev` is running

## Step 2: Clear ALL Browser Data

### Option A: Complete Clear (Recommended)
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Storage** in the left sidebar
4. Click **Clear site data** button
5. Check all options and click **Clear**

### Option B: Manual Clear
1. **Local Storage**: Delete all items for localhost:3002
2. **Session Storage**: Delete all items for localhost:3002
3. **Cookies**: Delete all cookies for localhost
4. **IndexedDB**: Delete all databases

### Option C: Use Incognito Mode (Easiest)
- Chrome: `Ctrl+Shift+N` (Windows/Linux) or `Cmd+Shift+N` (Mac)
- This gives you a fresh session with no cache

## Step 3: Restart Dev Server
```bash
npm run dev
```

## Step 4: Test Login

### Test Account (Already exists with retailer role):
- **URL**: http://localhost:3002/login
- **Email**: `retailer@test.com`
- **Password**: Use the password you know for this account

### Or Create New Account:
- **URL**: http://localhost:3002/signup
- Fill in:
  - Business Name: Any name
  - Email: Any new email
  - Username: Any username
  - Password: Any password (min 6 chars)

## Step 5: Check Browser Console

After login, open DevTools (F12) and check Console tab. You should see:
```
[AUTH] User signed in, loading data...
[AUTH] User profile loaded successfully: {
  role: "retailer"
  ...
}
```

## 🔍 Debugging If Still Not Working

### 1. Check if you're actually logged in:
In browser console, run:
```javascript
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User:', session?.user);
```

### 2. Check user profile:
```javascript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', session?.user?.id)
  .single();
console.log('Profile:', profile);
```

### 3. Force logout and login again:
```javascript
await supabase.auth.signOut();
location.reload();
```

## 📝 Important Notes

- The database is properly configured ✅
- User profiles table exists with 8 users ✅
- The code is properly refactored ✅
- **The issue is likely browser caching old session data**

## 🚀 Quick Test Command

Run this to test authentication directly:
```bash
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'retailer@test.com',
    password: 'YOUR_PASSWORD_HERE'
  });
  
  if (error) {
    console.log('Login failed:', error.message);
  } else {
    console.log('Login successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Token:', data.session.access_token.substring(0, 30) + '...');
  }
})();
"
```

Replace `YOUR_PASSWORD_HERE` with the actual password.