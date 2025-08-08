import { createClient } from '@supabase/supabase-js';

// Database setup utilities for tests
export class DatabaseSetup {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async createTestUser() {
    try {
      // Create or update test admin user
      const { data, error } = await this.supabase.auth.admin.createUser({
        email: 'admin@livrili.com',
        password: 'admin123',
        email_confirm: true,
      });

      if (error && error.message !== 'User already registered') {
        console.warn('Test user creation failed:', error.message);
      }

      return data;
    } catch (error) {
      console.warn('Test user setup failed:', error);
      return null;
    }
  }

  async createTestCategories() {
    try {
      const categories = [
        { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
        { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
        { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden supplies' },
        { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories' },
      ];

      for (const category of categories) {
        await this.supabase
          .from('categories')
          .upsert(category, { onConflict: 'slug' });
      }

      console.log('Test categories created');
    } catch (error) {
      console.warn('Test categories creation failed:', error);
    }
  }

  async createTestProducts() {
    try {
      // First get category IDs
      const { data: categories } = await this.supabase
        .from('categories')
        .select('id, slug');

      if (!categories || categories.length === 0) {
        console.warn('No categories found for test products');
        return;
      }

      const electronicsCategory = categories.find(c => c.slug === 'electronics');
      const clothingCategory = categories.find(c => c.slug === 'clothing');

      const products = [
        {
          name: 'Test Smartphone',
          slug: 'test-smartphone',
          description: 'A test smartphone for testing',
          price: 599.99,
          category_id: electronicsCategory?.id,
          sku: 'TST-PHONE-001',
          stock_quantity: 50,
          is_active: true,
        },
        {
          name: 'Test T-Shirt',
          slug: 'test-t-shirt',
          description: 'A test t-shirt for testing',
          price: 29.99,
          category_id: clothingCategory?.id,
          sku: 'TST-SHIRT-001',
          stock_quantity: 100,
          is_active: true,
        },
      ];

      for (const product of products) {
        if (product.category_id) {
          await this.supabase
            .from('products')
            .upsert(product, { onConflict: 'slug' });
        }
      }

      console.log('Test products created');
    } catch (error) {
      console.warn('Test products creation failed:', error);
    }
  }

  async createTestOrders() {
    try {
      // Get test products
      const { data: products } = await this.supabase
        .from('products')
        .select('id, name, price')
        .limit(2);

      if (!products || products.length === 0) {
        console.warn('No products found for test orders');
        return;
      }

      // Create test retailer first
      const { data: retailer } = await this.supabase
        .from('retailers')
        .upsert({
          business_name: 'Test Retailer Store',
          email: 'test@retailer.com',
          phone: '+213123456789',
          address: '123 Test Street, Algiers, Algeria',
          is_active: true,
        }, { onConflict: 'email' })
        .select()
        .single();

      if (!retailer) {
        console.warn('Failed to create test retailer');
        return;
      }

      const orders = [
        {
          order_number: 'TST-ORD-001',
          retailer_id: retailer.id,
          status: 'pending',
          total_amount: products[0].price,
          currency: 'DZD',
          notes: 'Test order for testing purposes',
        },
        {
          order_number: 'TST-ORD-002',
          retailer_id: retailer.id,
          status: 'completed',
          total_amount: products[1]?.price || products[0].price,
          currency: 'DZD',
          notes: 'Another test order',
        },
      ];

      for (const order of orders) {
        const { data: createdOrder } = await this.supabase
          .from('orders')
          .upsert(order, { onConflict: 'order_number' })
          .select()
          .single();

        if (createdOrder) {
          // Create order items
          await this.supabase
            .from('order_items')
            .upsert({
              order_id: createdOrder.id,
              product_id: products[0].id,
              quantity: 2,
              unit_price: products[0].price,
              total_price: products[0].price * 2,
            }, { onConflict: 'order_id,product_id' });
        }
      }

      console.log('Test orders created');
    } catch (error) {
      console.warn('Test orders creation failed:', error);
    }
  }

  async setupAllTestData() {
    console.log('Setting up test data...');
    
    await this.createTestUser();
    await this.createTestCategories();
    await this.createTestProducts();
    await this.createTestOrders();
    
    console.log('Test data setup completed');
  }

  async cleanupTestData() {
    try {
      console.log('Cleaning up test data...');
      
      // Clean up in reverse order due to foreign key constraints
      await this.supabase.from('order_items').delete().like('order_id', '%');
      await this.supabase.from('orders').delete().like('order_number', 'TST-%');
      await this.supabase.from('products').delete().like('slug', 'test-%');
      await this.supabase.from('categories').delete().like('slug', '%');
      await this.supabase.from('retailers').delete().eq('email', 'test@retailer.com');
      
      console.log('Test data cleanup completed');
    } catch (error) {
      console.warn('Test data cleanup failed:', error);
    }
  }
}

// Global setup function
export async function setupTestDatabase() {
  const dbSetup = new DatabaseSetup();
  await dbSetup.setupAllTestData();
}

// Global teardown function
export async function cleanupTestDatabase() {
  const dbSetup = new DatabaseSetup();
  await dbSetup.cleanupTestData();
}