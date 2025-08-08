#!/bin/bash

# Livrili Database Setup Script
# This script applies the fixed Supabase schema and seeds test data

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -z "$SUPABASE_URL" ]; then
        print_error "SUPABASE_URL environment variable is not set"
        exit 1
    fi
    
    if [ -z "$SUPABASE_ANON_KEY" ]; then
        print_error "SUPABASE_ANON_KEY environment variable is not set"
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_error "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
        exit 1
    fi
    
    print_success "Environment variables are properly set"
}

# Function to apply database schema
apply_schema() {
    print_status "Applying database schema..."
    
    # Use psql to apply the schema
    PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
        -h $(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.*@||' | cut -d':' -f1) \
        -p 5432 \
        -U postgres \
        -d postgres \
        -f packages/database/supabase-schema-fixed.sql
    
    if [ $? -eq 0 ]; then
        print_success "Database schema applied successfully"
    else
        print_error "Failed to apply database schema"
        exit 1
    fi
}

# Function to seed test data
seed_data() {
    print_status "Seeding test data..."
    
    # Use psql to seed the data
    PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
        -h $(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.*@||' | cut -d':' -f1) \
        -p 5432 \
        -U postgres \
        -d postgres \
        -f packages/database/seed-data-fixed.sql
    
    if [ $? -eq 0 ]; then
        print_success "Test data seeded successfully"
    else
        print_error "Failed to seed test data"
        exit 1
    fi
}

# Function to create test users through Supabase Auth API
create_test_users() {
    print_status "Creating test users..."
    
    # Test retailer user 1
    curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "retailer1@livrili.com",
            "password": "TestPass123!",
            "user_metadata": {
                "full_name": "Ahmed Hassan",
                "role": "retailer"
            },
            "email_confirm": true
        }'
    
    # Test retailer user 2  
    curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "retailer2@livrili.com",
            "password": "TestPass123!",
            "user_metadata": {
                "full_name": "Fatima Benaissa",
                "role": "retailer"
            },
            "email_confirm": true
        }'
        
    # Admin user
    curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@livrili.com",
            "password": "AdminPass123!",
            "user_metadata": {
                "full_name": "Livrili Admin",
                "role": "admin"
            },
            "email_confirm": true
        }'
    
    print_success "Test users created successfully"
}

# Function to link users to retailers
link_users_to_retailers() {
    print_status "Linking users to retailers..."
    
    # This will be handled by the database triggers when user_profiles are updated
    # with retailer_id values. For now, we'll update profiles manually via SQL
    
    PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
        -h $(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.*@||' | cut -d':' -f1) \
        -p 5432 \
        -U postgres \
        -d postgres \
        -c "
        -- Link retailer1@livrili.com to Central Grocery Store
        UPDATE user_profiles 
        SET retailer_id = 'ret-grocery-central'
        WHERE id = (
            SELECT id FROM auth.users WHERE email = 'retailer1@livrili.com'
        );
        
        -- Link retailer2@livrili.com to Ahmed Mini Market  
        UPDATE user_profiles 
        SET retailer_id = 'ret-minimarket-ahmed'
        WHERE id = (
            SELECT id FROM auth.users WHERE email = 'retailer2@livrili.com'
        );
        "
    
    print_success "Users linked to retailers successfully"
}

# Function to verify setup
verify_setup() {
    print_status "Verifying database setup..."
    
    # Check if tables exist and have data
    RESULT=$(PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql \
        -h $(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.*@||' | cut -d':' -f1) \
        -p 5432 \
        -U postgres \
        -d postgres \
        -t -c "
        SELECT 
            (SELECT COUNT(*) FROM categories) as categories_count,
            (SELECT COUNT(*) FROM products) as products_count,
            (SELECT COUNT(*) FROM retailers) as retailers_count,
            (SELECT COUNT(*) FROM user_profiles) as user_profiles_count;
        ")
    
    print_status "Database verification results:"
    echo "$RESULT"
    
    print_success "Database setup verification completed"
}

# Main execution
main() {
    print_status "Starting Livrili database setup..."
    
    # Navigate to project root
    cd "$(dirname "$0")"
    
    # Check prerequisites
    check_env_vars
    
    # Apply database changes
    apply_schema
    seed_data
    
    # Create and link test users
    create_test_users
    sleep 2  # Wait for user creation to complete
    link_users_to_retailers
    
    # Verify everything worked
    verify_setup
    
    print_success "Database setup completed successfully!"
    print_status "You can now test the retail portal with the following credentials:"
    echo "  - retailer1@livrili.com / TestPass123!"
    echo "  - retailer2@livrili.com / TestPass123!"
    echo "  - admin@livrili.com / AdminPass123!"
}

# Run the main function
main "$@"