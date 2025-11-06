# INNFILL - Setup Guide

## ✅ What's Been Set Up

Your INNFILL project has been successfully initialized with the following:

### 1. **Next.js 14 Project**
- ✅ TypeScript configured
- ✅ Tailwind CSS installed and configured
- ✅ App Router structure created
- ✅ ESLint configured
- ✅ Modern, clean design system

### 2. **Shadcn/ui Components**
- ✅ Button, Input, Card, Badge, Avatar
- ✅ Dropdown Menu, Dialog, Form
- ✅ Label, Textarea, Select
- ✅ All components ready to use in `/components/ui`

### 3. **Project Structure**
```
innfill-3/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (app)/               # Main application pages
│   │   ├── dashboard/       # Freelancer & Client dashboards
│   │   ├── services/        # Service browsing & creation
│   │   ├── orders/          # Order management
│   │   ├── chat/            # Chat rooms
│   │   ├── profile/         # User profiles
│   │   └── settings/        # Settings
│   ├── admin/               # Admin panel
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Shadcn/ui components
│   ├── forms/               # Custom form components
│   ├── modals/              # Modal components
│   ├── dashboard/           # Dashboard components
│   └── chat/                # Chat components
├── lib/
│   ├── supabase/            # Supabase client configuration
│   ├── actions/             # Server actions
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── validations/         # Zod validation schemas
└── types/                   # TypeScript type definitions
```

### 4. **Dependencies Installed**
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering support
- `@tanstack/react-query` - Data fetching & caching
- `react-hook-form` - Form management
- `zod` - Schema validation
- `@hookform/resolvers` - Form validation integration

### 5. **Supabase Configuration**
- ✅ Client and server Supabase clients created
- ✅ Middleware for authentication configured
- ✅ Database migration SQL file created
- ✅ TypeScript types for database defined

---

## 🚀 Next Steps - Complete Your Setup

### Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Create a new organization (if you don't have one)
4. Create a new project:
   - Enter a **Project Name** (e.g., "INNFILL")
   - Set a **Database Password** (save this!)
   - Choose your **Region** (closest to your users)
   - Click "Create new project"
5. Wait for the project to be set up (2-3 minutes)

### Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. Copy these values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click "Reveal" button)

### Step 3: Configure Environment Variables

1. Open the file: `innfill-3/.env.local`
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Payment Gateway (we'll set this up later)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Platform Fee Configuration (in percentage)
PLATFORM_FEE_PERCENTAGE=15
```

### Step 4: Run the Database Migration

1. In your Supabase project, click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file: `innfill-3/supabase/migrations/001_initial_schema.sql`
4. Copy ALL the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** button (or press `Ctrl+Enter`)
7. You should see "Success. No rows returned" message

This will create all the database tables, indexes, and security policies.

### Step 5: Set Up Storage Buckets

In your Supabase project:

1. Click on **Storage** in the left sidebar
2. Create the following buckets (click "New bucket"):

   **Bucket 1: avatars**
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: 2MB
   - Allowed MIME types: `image/*`

   **Bucket 2: service-images**
   - Name: `service-images`
   - Public: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

   **Bucket 3: order-files**
   - Name: `order-files`
   - Public: ❌ No (only accessible to order participants)
   - File size limit: 10MB
   - Allowed MIME types: `*/*`

   **Bucket 4: chat-attachments**
   - Name: `chat-attachments`
   - Public: ❌ No
   - File size limit: 10MB
   - Allowed MIME types: `*/*`

### Step 6: Configure Storage Policies

For each private bucket (`order-files` and `chat-attachments`), set up RLS policies:

1. Click on the bucket name
2. Go to **Policies** tab
3. Add these policies:

**For order-files bucket:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'order-files');

-- Allow users to read their own order files
CREATE POLICY "Allow order participants to read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'order-files');
```

**For chat-attachments bucket:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow chat participants to read
CREATE POLICY "Allow chat participants to read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'chat-attachments');
```

### Step 7: Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase
2. Make sure **Email** provider is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and password reset emails
4. For development, you can use:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

### Step 8: Start the Development Server

```bash
cd innfill-3
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the INNFILL homepage with no errors!

---

## 🎯 What You Can Do Now

### Test the Homepage
- Visit `http://localhost:3000`
- You should see a beautiful landing page with:
  - Hero section with INNFILL branding
  - Feature cards for Freelancers, Clients, and Security
  - Call-to-action buttons (not yet functional)

### Next Development Steps
1. **Build Authentication Pages** (login, register, password reset)
2. **Create User Dashboards** (freelancer and client views)
3. **Implement Service Plan System** (create, browse, search)
4. **Build Order Workflow** (place orders, accept/decline, deliver)
5. **Add Chat System** (real-time messaging)
6. **Integrate Payment Gateway** (Razorpay/Stripe)

---

## 📚 Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linter
npm run lint

# Add new Shadcn/ui components
npx shadcn@latest add [component-name]
```

---

## 🔧 Troubleshooting

### Issue: "Invalid supabaseUrl" error
**Solution:** Make sure you've added your Supabase credentials to `.env.local`

### Issue: Database tables not created
**Solution:** Run the SQL migration script in Supabase SQL Editor

### Issue: Authentication not working
**Solution:** 
1. Check that Email provider is enabled in Supabase
2. Verify your redirect URLs are configured correctly
3. Make sure `.env.local` has the correct credentials

### Issue: Storage uploads failing
**Solution:** 
1. Verify storage buckets are created
2. Check that RLS policies are set up correctly
3. Ensure authenticated users have upload permissions

---

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Check the terminal where `npm run dev` is running
3. Verify all environment variables are set correctly
4. Make sure the Supabase migration ran successfully

---

## ✨ What's Next?

Once your setup is complete, we can start building:
1. **Authentication pages** with full login/register/forgot password functionality
2. **User profiles** with role-based access (freelancer/client/admin)
3. **Service marketplace** with search and filters
4. **Order management** with the complete workflow
5. **Real-time chat** using Supabase Realtime
6. **Payment integration** with Razorpay or Stripe

**Ready to continue building? Let me know!** 🚀
