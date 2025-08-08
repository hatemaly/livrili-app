#!/bin/bash

# Livrili Database Setup Script
# Sets up the database schema and test data

echo "🚀 Livrili Database Setup Script"
echo "================================"

# Load environment variables
if [ -f "apps/retail-portal/.env.local" ]; then
    export $(cat apps/retail-portal/.env.local | grep -v '^#' | xargs)
fi

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Supabase environment variables not found!"
    echo "Please ensure .env.local is properly configured in apps/retail-portal/"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📦 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"

# Function to execute SQL via Supabase API
execute_sql() {
    local sql_file=$1
    local description=$2
    
    echo "⏳ Executing: $description..."
    
    # Note: This requires Supabase CLI or direct database access
    # For now, we'll provide instructions for manual execution
    
    echo "📋 SQL file created: $sql_file"
    echo "   Please execute this file in your Supabase SQL editor"
}

# Create schema and seed data
echo ""
echo "📊 Database Setup Steps:"
echo "------------------------"

execute_sql "packages/database/supabase-schema.sql" "Database schema"
execute_sql "packages/database/seed-data.sql" "Test data"

echo ""
echo "🔐 Test Credentials:"
echo "-------------------"
echo "Username: test"
echo "Password: test123"
echo "Retailer ID: 11111111-1111-1111-1111-111111111111"
echo ""
echo "Alternative test users:"
echo "- Username: demo, Password: test123"
echo "- Username: retailer1, Password: test123"
echo "- Username: admin, Password: test123 (admin role)"

echo ""
echo "📝 Manual Setup Instructions:"
echo "-----------------------------"
echo "1. Go to your Supabase dashboard: $NEXT_PUBLIC_SUPABASE_URL"
echo "2. Navigate to SQL Editor"
echo "3. Execute the following SQL files in order:"
echo "   a) packages/database/supabase-schema.sql"
echo "   b) packages/database/seed-data.sql"
echo "4. Configure Authentication:"
echo "   - Enable Email/Password authentication"
echo "   - Disable email confirmation for testing"

echo ""
echo "🚀 Next Steps:"
echo "--------------"
echo "1. Run the retail portal: cd apps/retail-portal && npm run dev"
echo "2. Access at: http://localhost:3002"
echo "3. Login with test credentials above"
echo "4. Run tests: npm run test:e2e"

echo ""
echo "✅ Setup instructions complete!"