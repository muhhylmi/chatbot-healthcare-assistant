#!/usr/bin/env node

/**
 * Supabase Initialization Helper Script
 * Run this script to help set up your Supabase environment
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 HealthCare+ Supabase Setup Helper\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    console.log('❌ .env.example file not found');
    process.exit(1);
  }
}

console.log('\n📋 Setup Steps:');
console.log('1. Connect to Supabase via MCP Integration (Recommended):');
console.log('   - Use the "Open MCP popover" button');
console.log('   - Connect to Supabase');
console.log('   - This provides full database management\n');

console.log('2. Or Manual Setup:');
console.log('   - Create account at https://supabase.com');
console.log('   - Create a new project');
console.log('   - Get your Project URL and API keys');
console.log('   - Update the .env file with your credentials');
console.log('   - Run the SQL migration in database/migrations/001_create_users_table.sql\n');

console.log('📁 Next steps:');
console.log('   - Edit .env file with your Supabase credentials');
console.log('   - Run: npm run dev');
console.log('   - Test user registration and login\n');

console.log('📖 For detailed instructions, see: docs/SUPABASE_SETUP.md');

// Check current .env file status
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasSupabaseUrl = envContent.includes('SUPABASE_URL=') && !envContent.includes('your_supabase_project_url');
  const hasSupabaseKey = envContent.includes('SUPABASE_ANON_KEY=') && !envContent.includes('your_supabase_anon_key');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('\n✅ Supabase credentials appear to be configured in .env');
  } else {
    console.log('\n⚠️  Please update .env file with your Supabase credentials');
  }
} catch (error) {
  console.log('\n❌ Error reading .env file:', error.message);
}
