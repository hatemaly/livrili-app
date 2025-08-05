# Fix RLS Recursion Error

## The Problem
You're seeing this error:
```
infinite recursion detected in policy for relation "users"
```

This happens because the RLS policies are trying to check the users table while accessing the users table, creating an infinite loop.

## Quick Fix

1. **Open Supabase SQL Editor**
   - Go to: https://app.supabase.com/project/yklrjzlidixjlbhppltf/sql/new

2. **Run the Fix Script**
   - Copy everything from: `/packages/database/supabase/fix-rls-policies.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify the Fix**
   - Refresh your app
   - The error should be gone

## What This Fixes

### Old Problem Policies
The old policies had circular references:
- "Admins can view all users" → Checks users table → Triggers policy check → Infinite loop

### New Solution
- Uses `auth.uid()` directly (no recursion)
- Creates `is_admin()` function for admin checks
- Service role bypass for triggers
- Better error handling in OAuth trigger

## Testing

After running the fix:
1. Try logging in with username/password
2. Try "Continue with Google"
3. Check browser console - no more 500 errors

## If Still Having Issues

1. **Check if policies were created**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

2. **Check if function exists**:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'is_admin';
   ```

3. **Test the function**:
   ```sql
   SELECT is_admin();
   ```

## Alternative: Disable RLS Temporarily

If you need to work while fixing:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

But remember to re-enable it:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```