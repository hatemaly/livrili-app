#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTestUser() {
  console.log('🔧 Setting up test user for admin portal...\n');

  try {
    // Step 1: Check if user exists in auth
    const email = 'admin@test.com';
    const password = 'test123';
    
    console.log('📧 Test user email:', email);
    console.log('🔑 Test user password:', password);
    
    // Step 2: Try to sign in first to check if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    let userId;
    
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      console.log('\n✨ Creating new test user...');
      
      // Create the user
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          name: 'Test Admin',
          isAdmin: true
        }
      });

      if (signUpError) {
        console.error('❌ Error creating user:', signUpError);
        process.exit(1);
      }

      userId = signUpData.user.id;
      console.log('✅ User created with ID:', userId);
    } else if (signInData && signInData.user) {
      userId = signInData.user.id;
      console.log('\n✅ User already exists with ID:', userId);
      
      // Update user metadata to ensure admin role
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          role: 'admin',
          name: 'Test Admin',
          isAdmin: true
        }
      });

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError);
      } else {
        console.log('✅ User metadata updated to admin role');
      }
    } else {
      console.error('❌ Unexpected error:', signInError);
      process.exit(1);
    }

    // Step 3: Check/Create user in users table
    console.log('\n📊 Checking users table...');
    
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (selectError && selectError.code === 'PGRST116') {
      // User doesn't exist in users table, create it
      console.log('➕ Creating user in users table...');
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          name: 'Test Admin',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error creating user in users table:', insertError);
        // Try upsert as fallback
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: email,
            name: 'Test Admin',
            role: 'admin',
            is_active: true,
            updated_at: new Date().toISOString()
          });

        if (upsertError) {
          console.error('❌ Error upserting user:', upsertError);
        } else {
          console.log('✅ User upserted in users table');
        }
      } else {
        console.log('✅ User created in users table');
      }
    } else if (existingUser) {
      console.log('✅ User exists in users table');
      
      // Update role to admin if needed
      if (existingUser.role !== 'admin') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Error updating user role:', updateError);
        } else {
          console.log('✅ User role updated to admin');
        }
      }
    }

    // Step 4: Remove from retailers table if exists (admin shouldn't be retailer)
    console.log('\n🏪 Checking retailers table...');
    
    const { data: retailerData, error: retailerSelectError } = await supabase
      .from('retailers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (retailerData) {
      console.log('🗑️  Removing user from retailers table (admin should not be retailer)...');
      const { error: deleteError } = await supabase
        .from('retailers')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('⚠️  Warning: Could not remove from retailers table:', deleteError);
      } else {
        console.log('✅ Removed from retailers table');
      }
    } else {
      console.log('✅ User is not in retailers table (correct)');
    }

    // Step 5: Test authentication
    console.log('\n🔐 Testing authentication...');
    
    const { data: testSignIn, error: testError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (testError) {
      console.error('❌ Test sign-in failed:', testError);
      process.exit(1);
    }

    console.log('✅ Authentication successful!');
    console.log('👤 User role:', testSignIn.user.user_metadata.role);
    console.log('🎯 Is Admin:', testSignIn.user.user_metadata.isAdmin);

    // Sign out
    await supabase.auth.signOut();

    console.log('\n' + '='.repeat(50));
    console.log('✨ Test user setup complete!');
    console.log('='.repeat(50));
    console.log('\n📝 Test Credentials:');
    console.log('   Email: admin@test.com');
    console.log('   Password: test123');
    console.log('   Role: admin');
    console.log('\n🚀 You can now run the automated tests!');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the setup
setupTestUser();