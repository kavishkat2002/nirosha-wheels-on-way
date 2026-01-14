#!/bin/bash

# Simple helper script to open Supabase SQL Editor
# Run this with: bash open-supabase.sh

echo "🚀 Opening Supabase Dashboard..."
echo ""
echo "📋 What to do next:"
echo "1. Login to your Supabase account"
echo "2. Select your project"
echo "3. Click 'SQL Editor' in the left sidebar"
echo "4. Click 'New Query'"
echo "5. Paste the SQL from: supabase/migrations/20260111124700_create_profiles_table.sql"
echo "6. Click 'Run' (or press Cmd+Enter)"
echo ""
echo "Opening browser..."

# Open Supabase dashboard
open "https://supabase.com/dashboard" || xdg-open "https://supabase.com/dashboard" 2>/dev/null

echo "✅ Browser opened!"
echo ""
echo "📄 SQL file location:"
echo "$(pwd)/supabase/migrations/20260111124700_create_profiles_table.sql"
