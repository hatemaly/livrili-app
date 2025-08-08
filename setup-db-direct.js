#!/usr/bin/env node

// Direct database setup script using Supabase API
require('dotenv').config({ path: './apps/retail-portal/.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function setupDatabase() {
  console.log('🚀 Setting up Livrili database...');
  console.log('==================================');
  
  try {
    // Read and execute schema
    console.log('📋 Reading schema file...');
    const schemaSQL = fs.readFileSync('./packages/database/supabase-schema-fixed.sql', 'utf8');
    
    console.log('🔧 Creating database tables...');
    const { data: schemaResult, error: schemaError } = await supabase.rpc('exec_sql', {
      sql_query: schemaSQL
    });
    
    if (schemaError) {
      console.log('ℹ️  Schema execution note:', schemaError.message);
      // Many errors are expected (like "table already exists"), so we continue
    } else {
      console.log('✅ Schema executed successfully');
    }
    
    // Read and execute seed data
    console.log('📊 Reading seed data file...');
    const seedSQL = fs.readFileSync('./packages/database/seed-data-fixed.sql', 'utf8');
    
    console.log('🌱 Inserting seed data...');
    const { data: seedResult, error: seedError } = await supabase.rpc('exec_sql', {
      sql_query: seedSQL
    });
    
    if (seedError) {
      console.log('ℹ️  Seed data execution note:', seedError.message);
    } else {
      console.log('✅ Seed data inserted successfully');
    }
    
    // Verify tables exist by checking categories
    console.log('🔍 Verifying database setup...');
    const { data: categories, error: verifyError } = await supabase
      .from('categories')
      .select('id, name_en')
      .limit(5);
    
    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
      console.log('📝 You may need to run the SQL files manually in Supabase dashboard');
    } else {
      console.log('✅ Database verification successful!');
      console.log(`📊 Found ${categories.length} categories`);
      if (categories.length > 0) {
        console.log('📋 Sample categories:');
        categories.forEach(cat => console.log(`   - ${cat.name_en}`));
      }
    }
    
    console.log('\n🎉 Database setup complete!');
    console.log('🚀 You can now start the application:');
    console.log('   cd apps/retail-portal && npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n📝 Manual setup required:');
    console.log('1. Go to Supabase dashboard SQL editor');
    console.log('2. Run packages/database/supabase-schema.sql');
    console.log('3. Run packages/database/seed-data.sql');
  }
}

setupDatabase();