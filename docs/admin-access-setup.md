# Admin Access Setup Guide

## Issue: Redirected to /unauthorized

This happens when the logged-in user doesn't have admin role.

## Quick Fix Steps

### 1. Check Your User's Role

Run this SQL in Supabase:
```sql
-- Find your user
SELECT 
  u.id,
  u.email,
  u.username,
  u.role,
  u.auth_provider
FROM users u
WHERE u.email = 'your-email@gmail.com';  -- Replace with your email
```

### 2. Make Yourself Admin

If your role is 'retailer', update it:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@gmail.com';  -- Replace with your email
```

### 3. For Username/Password Login

If you haven't created a user yet, do this:

1. First create auth user in Supabase Dashboard:
   - Go to Authentication > Users
   - Click "Add user" > "Create new user"
   - Enter email and password
   - Copy the user ID

2. Then create the admin user profile:
```sql
INSERT INTO users (id, email, username, full_name, role, is_active)
VALUES (
  'paste-user-id-here',      -- From step 1
  'admin@example.com',       -- Your email
  'admin',                   -- Your username
  'Admin User',              -- Your name
  'admin',                   -- Admin role
  true
);
```

### 4. For Google OAuth Login

If you logged in with Google and need admin access:
```sql
-- Update existing Google user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-google-email@gmail.com';
```

## Verify It Works

1. Sign out if you're logged in
2. Sign in again
3. You should now access the admin dashboard

## Troubleshooting

### Still getting /unauthorized?
1. Clear browser cookies/cache
2. Check browser console for errors
3. Make sure the role update was successful

### Can't find your user?
The OAuth trigger might have failed. Create manually:
```sql
-- Get your auth.users ID first
SELECT id, email FROM auth.users WHERE email = 'your-email@gmail.com';

-- Then insert into users table
INSERT INTO users (id, email, role, auth_provider, is_active)
VALUES (
  'your-auth-id',
  'your-email@gmail.com',
  'admin',
  'google',
  true
);
```

### Check Current Session
You can check who's logged in:
```sql
-- In browser console
const { data: { user } } = await supabase.auth.getUser()
console.log(user)
```

## Admin vs Retailer Access

- **Admin Portal** (port 3001): Requires `role = 'admin'`
- **Retail Portal** (port 3002): Any authenticated user

Make sure you're accessing the right portal for your role!