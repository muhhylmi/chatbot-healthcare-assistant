# Supabase Setup Guide for HealthCare+ App

## 1. Connect to Supabase via MCP Integration

The easiest way to set up Supabase is through the MCP integration:

1. [Open MCP popover](#open-mcp-popover) 
2. Connect to **Supabase** 
3. This will provide database management, authentication, real-time subscriptions, and backend services

## 2. Manual Setup (Alternative)

If you prefer manual setup:

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Create a new project
4. Wait for the project to be set up

### Step 2: Get Your Keys
1. Go to Project Settings → API
2. Copy the following:
   - Project URL
   - `anon` key  
   - `service_role` key

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 4: Run Database Migration
1. Go to your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the content from `database/migrations/001_create_users_table.sql`
4. Run the SQL to create the users table

## 3. Features Enabled

With Supabase integration, your HealthCare+ app gets:

✅ **Secure Authentication** - Proper password hashing with crypto  
✅ **PostgreSQL Database** - Professional-grade database  
✅ **Row Level Security** - Users can only access their own data  
✅ **Real-time Capabilities** - Ready for real-time features  
✅ **Automatic Backups** - Supabase handles backups  
✅ **HIPAA Compliance Ready** - Important for healthcare apps  

## 4. Testing the Integration

1. Start your development server: `npm run dev`
2. Try creating a new account
3. Login with your credentials
4. Check your Supabase dashboard to see the user data

## 5. Production Deployment

For production:
1. Use environment variables in your deployment platform
2. Never commit `.env` file to git
3. Consider using Supabase's connection pooling for high traffic
4. Enable additional security features in Supabase dashboard

## Need Help?

- Check Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- Use the MCP integration for easier setup
- Contact support if you encounter issues
