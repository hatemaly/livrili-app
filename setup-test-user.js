const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yklrjzlidixjlbhppltf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrbHJqemxpZGl4amxiaHBwbHRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg2NjI1NSwiZXhwIjoyMDY4NDQyMjU1fQ.jOtuPyPpsbxoi9oNh1f34tdVDIHb9oAEcAIarFa_0g8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestUser() {
  try {
    console.log('🔧 Setting up test user...');
    
    // Check existing users
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    console.log(`📊 Found ${existingUsers.users.length} existing users`);
    
    // Check if test user already exists
    const testUser = existingUsers.users.find(user => user.email === 'admin@test.com');
    if (testUser) {
      console.log('✅ Test user admin@test.com already exists');
      return;
    }
    
    // Create test user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'test123',
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    });
    
    if (createError) {
      throw createError;
    }
    
    console.log('✅ Test user created successfully:', newUser.user.email);
    
    // Try to create admin profile in the users table if it exists
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: newUser.user.id,
          email: 'admin@test.com',
          role: 'admin',
          status: 'active'
        }
      ])
      .select();
    
    if (profileError) {
      console.log('ℹ️  Note: Could not create user profile (table may not exist):', profileError.message);
    } else {
      console.log('✅ User profile created');
    }
    
  } catch (err) {
    console.error('❌ Error setting up test user:', err.message);
  }
}

setupTestUser();