#!/bin/bash

# Apply Database Relationship Fix for Livrili Admin Portal
# This script fixes the "Could not find a relationship" errors

echo "🔧 Applying database relationship fixes..."

# Check if we have Supabase CLI available
if command -v supabase &> /dev/null; then
    echo "📡 Using Supabase CLI to apply migration..."
    supabase db push --file packages/database/fix-relationships.sql
else
    echo "⚠️  Supabase CLI not found. Please run the SQL manually:"
    echo ""
    echo "1. Open your Supabase Dashboard"
    echo "2. Go to SQL Editor"
    echo "3. Copy and paste the contents of packages/database/fix-relationships.sql"
    echo "4. Run the query"
    echo ""
    echo "📄 SQL file location: $(pwd)/packages/database/fix-relationships.sql"
fi

echo ""
echo "✅ Database relationship fixes applied!"
echo ""
echo "🚀 Next steps:"
echo "1. Restart your application: npm run dev"
echo "2. Test the admin portal deliveries and drivers pages"
echo "3. Check for any remaining relationship errors"
echo ""
echo "📖 For more details, see: packages/database/README-relationship-fix.md"