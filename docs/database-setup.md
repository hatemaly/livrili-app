# Database Setup Guide

This guide will help you set up the Livrili database in Supabase.

## Steps to Create Tables

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com/project/yklrjzlidixjlbhppltf
   - Navigate to the SQL Editor (left sidebar)

2. **Run the Setup Script**
   - Open the file: `/packages/database/supabase/setup.sql`
   - Copy the entire content
   - Paste it into the SQL Editor
   - Click "Run" button

3. **Verify Tables Created**
   - Go to Table Editor (left sidebar)
   - You should see these tables:
     - `users`
     - `retailers`
     - `categories`
     - `products`
     - `orders`
     - `order_items`
     - `payments`
     - `audit_logs`
     - `user_sessions`

## Create Your First Admin User

1. **Create Auth User**
   - Go to Authentication > Users
   - Click "Add user" → "Create new user"
   - Enter email and password
   - Click "Create user"
   - Copy the user ID

2. **Make User Admin**
   - Go to SQL Editor
   - Run this query (replace with your user ID):
   ```sql
   INSERT INTO users (id, username, full_name, role, is_active, email)
   VALUES (
     'paste-your-user-id-here',
     'admin',
     'Admin User',
     'admin',
     true,
     'your-email@example.com'
   );
   ```

## Test the Setup

1. **Start the development servers**:
   ```bash
   npm run dev
   ```

2. **Try logging in**:
   - Admin Portal: http://localhost:3001
   - Use the admin credentials you created

## Database Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Automatic timestamps**: `created_at` and `updated_at` fields
- **OAuth Support**: Google authentication ready
- **Multi-language**: Support for Arabic, French, and English
- **Audit Logging**: Track all user actions

## Troubleshooting

### "Permission denied" errors
- Make sure RLS is enabled
- Check that your user has the correct role
- Verify the RLS policies are created

### Can't see tables
- Refresh the Table Editor page
- Check SQL Editor for any errors
- Make sure the script ran completely

### Authentication issues
- Verify your Supabase URL and keys in `.env.local`
- Check that the user exists in both `auth.users` and `public.users`

## Next Steps

1. Configure Google OAuth (see `google-oauth-setup.md`)
2. Add sample data for testing
3. Set up environment variables
4. Start development