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

async function setupTestRetailer() {
  console.log('🔧 Setting up test retailer for retail portal...\n');

  try {
    // Step 1: Define test retailer credentials
    const email = 'retailer@test.com';
    const password = 'test123';
    const username = 'testretailer';
    
    console.log('📧 Test retailer email:', email);
    console.log('👤 Test retailer username:', username);
    console.log('🔑 Test retailer password:', password);
    
    // Step 2: Try to sign in first to check if user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    let userId;
    
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      console.log('\n✨ Creating new test retailer user...');
      
      // Create the user
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'retailer',
          name: 'Test Retailer',
          username: username,
          isAdmin: false
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
      
      // Update user metadata to ensure retailer role
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          role: 'retailer',
          name: 'Test Retailer',
          username: username,
          isAdmin: false
        }
      });

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError);
      } else {
        console.log('✅ User metadata updated to retailer role');
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
          name: 'Test Retailer',
          username: username,
          role: 'retailer',
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
            name: 'Test Retailer',
            username: username,
            role: 'retailer',
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
      
      // Update role to retailer if needed
      if (existingUser.role !== 'retailer') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'retailer',
            username: username,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Error updating user role:', updateError);
        } else {
          console.log('✅ User role updated to retailer');
        }
      }
    }

    // Step 4: Check/Create retailer in retailers table
    console.log('\n🏪 Checking retailers table...');
    
    const { data: retailerData, error: retailerSelectError } = await supabase
      .from('retailers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (retailerSelectError && retailerSelectError.code === 'PGRST116') {
      console.log('➕ Creating retailer profile...');
      
      const { error: retailerInsertError } = await supabase
        .from('retailers')
        .insert({
          user_id: userId,
          business_name: 'Test Retail Store',
          business_name_ar: 'متجر التجزئة التجريبي',
          contact_name: 'Test Retailer',
          phone: '+213555123456',
          email: email,
          address: '123 Test Street',
          city: 'Algiers',
          state: 'Algiers',
          credit_limit: 100000.00, // 100,000 DZD credit limit
          current_balance: 0,
          status: 'active',
          payment_terms: 'net30',
          tax_id: 'TEST123456',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (retailerInsertError) {
        console.error('❌ Error creating retailer:', retailerInsertError);
        // Try with minimal fields
        const { error: minimalError } = await supabase
          .from('retailers')
          .insert({
            user_id: userId,
            business_name: 'Test Retail Store',
            phone: '+213555123456',
            status: 'active'
          });
          
        if (minimalError) {
          console.error('❌ Error creating minimal retailer:', minimalError);
        } else {
          console.log('✅ Minimal retailer profile created');
        }
      } else {
        console.log('✅ Retailer profile created');
      }
    } else if (retailerData) {
      console.log('✅ Retailer profile exists');
      
      // Update status to active if needed
      if (retailerData.status !== 'active') {
        const { error: updateError } = await supabase
          .from('retailers')
          .update({ 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('⚠️  Warning: Could not update retailer status:', updateError);
        } else {
          console.log('✅ Retailer status updated to active');
        }
      }
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
    console.log('🏪 Is Retailer:', testSignIn.user.user_metadata.role === 'retailer');

    // Sign out
    await supabase.auth.signOut();

    console.log('\n' + '='.repeat(50));
    console.log('✨ Test retailer setup complete!');
    console.log('='.repeat(50));
    console.log('\n📝 Test Credentials:');
    console.log('   Email: retailer@test.com');
    console.log('   Username: testretailer');
    console.log('   Password: test123');
    console.log('   Role: retailer');
    console.log('   Business: Test Retail Store');
    console.log('\n🚀 You can now run the retail portal tests!');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the setup
setupTestRetailer();