# Debug Admin Access Issue

## The Problem
- User has `role: admin` in database ✓
- `last_login_at` updates properly ✓
- Still redirects to `/unauthorized` ✗

This means the frontend is not getting the user data properly.

## Step 1: Check Browser Console

Open browser DevTools (F12) and look for:
```
AuthGuard Debug: {
  requireAuth: true,
  requireAdmin: true,
  isAuthenticated: ???,
  isAdmin: ???,
  loading: ???,
  userRole: ???
}
```

If `isAdmin` is false or `userRole` is undefined, the user data isn't loading.

## Step 2: Disable RLS Temporarily

Run this in Supabase SQL Editor:
```sql
-- Disable RLS to test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

Then reload the app. If it works, the issue is with RLS policies.

## Step 3: Check Network Tab

1. Open Network tab in DevTools
2. Look for requests to `/rest/v1/users`
3. Check if they return 200 or 500 status
4. Look at the response

## Step 4: Test Direct Query

In Supabase SQL Editor, run:
```sql
-- Get your current auth user ID
SELECT auth.uid();

-- Then check your user data
SELECT * FROM users WHERE id = 'your-auth-uid';

-- Check if is_admin() works
SELECT is_admin();
```

## Step 5: Quick Fix Options

### Option A: Disable RLS (Temporary)
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### Option B: Create Simpler Policy
```sql
-- Drop all policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;

-- Create one simple policy
CREATE POLICY "Allow all for authenticated users" ON users
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Option C: Use Service Role Key (Development Only)
In your `.env.local`, temporarily use the service role key:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-service-role-key
```
**WARNING**: Don't do this in production!

## Step 6: Re-enable Security

After fixing, always re-enable RLS:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## Common Causes

1. **RLS Policy Recursion**: Even with the fix, policies might still be problematic
2. **Cache Issues**: Browser might be caching old session data
3. **Timing Issue**: User data might not be loaded when AuthGuard checks
4. **Type Mismatch**: Role might be stored differently than expected

## Nuclear Option

If nothing works, create a new simple test:
```typescript
// In your component
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single()
  
console.log('Direct test:', { user, profile })
```