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

async function seedTestData() {
  console.log('🌱 Seeding test data for retail portal...\n');

  try {
    // Step 1: Create categories
    console.log('📦 Creating product categories...');
    
    const categories = [
      { 
        name: 'Food & Beverages',
        slug: 'food-beverages'
      },
      { 
        name: 'Personal Care',
        slug: 'personal-care'
      },
      { 
        name: 'Household',
        slug: 'household'
      }
    ];
    
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'name' })
      .select();
    
    if (categoryError) {
      console.error('❌ Error creating categories:', categoryError);
    } else {
      console.log('✅ Categories created:', categoryData.length);
    }
    
    // Step 2: Create products
    console.log('\n📦 Creating products...');
    
    const products = [
      // Food & Beverages
      {
        name: 'Coca Cola 330ml',
        sku: 'COK330',
        category_id: categoryData?.[0]?.id,
        price: 120.00,
        stock: 500
      },
      {
        name: 'Pepsi 330ml',
        sku: 'PEP330',
        category_id: categoryData?.[0]?.id,
        price: 115.00,
        stock: 450
      },
      {
        name: 'Mineral Water 1.5L',
        sku: 'WAT150',
        category_id: categoryData?.[0]?.id,
        price: 80.00,
        stock: 1000
      },
      // Personal Care
      {
        name: 'Dove Soap 100g',
        sku: 'DOV100',
        category_id: categoryData?.[1]?.id,
        price: 250.00,
        stock: 200
      },
      {
        name: 'Head & Shoulders Shampoo 400ml',
        sku: 'HAS400',
        category_id: categoryData?.[1]?.id,
        price: 650.00,
        stock: 150
      },
      // Household
      {
        name: 'Tide Detergent 1kg',
        sku: 'TID1KG',
        category_id: categoryData?.[2]?.id,
        price: 850.00,
        stock: 100
      },
      {
        name: 'Ajax Floor Cleaner 1L',
        sku: 'AJX1L',
        category_id: categoryData?.[2]?.id,
        price: 380.00,
        stock: 80
      }
    ];
    
    const { data: productData, error: productError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'sku' })
      .select();
    
    if (productError) {
      console.error('❌ Error creating products:', productError);
    } else {
      console.log('✅ Products created:', productData.length);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ Test data seeding complete!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log('   Categories: 3 (Food & Beverages, Personal Care, Household)');
    console.log('   Products: 7 items with stock');
    console.log('\n🚀 The retail portal now has test data for shopping!');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the seeding
seedTestData();