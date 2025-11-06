# INNFILL - Freelance Marketplace Platform

A modern, full-stack freelance marketplace that connects talented freelancers with clients worldwide. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

![INNFILL](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)

## 🚀 Features

### For Freelancers
- ✨ Create custom service plans with 3 pricing tiers (Basic/Standard/Premium)
- 💰 Set your own prices and delivery timelines
- 🔒 Secure payment escrow system
- 💬 Real-time chat with clients
- 📊 Earnings dashboard and withdrawal system
- 📁 File delivery system with multiple attachments

### For Clients
- 🔍 Browse and search freelance services
- 💳 Transparent pricing with multiple tiers
- 📝 Provide detailed project requirements
- ⚡ Real-time order status updates
- ✅ Review and approve deliverables
- 💬 Direct communication with freelancers

### Platform Features
- 🔐 Secure authentication with email verification
- 👤 Role-based access (Freelancer/Client/Admin)
- 📨 Real-time notifications
- 💸 Escrow payment system
- 📦 File upload and management
- 📱 Fully responsive design
- 🌙 Dark mode support
- ⚡ Lightning-fast performance

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, Authentication, Storage, Realtime)
- **State Management:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod validation
- **Payments:** Razorpay/Stripe (configurable)

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works great!)
- Git for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mani-1509/Innfill-3.git
cd Innfill-3/innfill-3
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

Follow the detailed instructions in [SETUP_GUIDE.md](./SETUP_GUIDE.md) to:
- Create your Supabase project
- Get your API credentials
- Run the database migration
- Set up storage buckets
- Configure authentication

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Platform Settings
PLATFORM_FEE_PERCENTAGE=15
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app! 🎉

## 📁 Project Structure

```
innfill-3/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (app)/               # Main application
│   ├── admin/               # Admin panel
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── forms/               # Form components
│   ├── modals/              # Modal dialogs
│   └── dashboard/           # Dashboard widgets
├── lib/
│   ├── supabase/            # Supabase configuration
│   ├── actions/             # Server actions
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── validations/         # Zod schemas
├── types/                   # TypeScript types
└── supabase/
    └── migrations/          # Database migrations
```

## 🎯 Development Roadmap

### Phase 1: Foundation ✅
- [x] Next.js project setup
- [x] Supabase configuration
- [x] Database schema
- [x] Authentication system

### Phase 2: Core Features (In Progress)
- [ ] User profiles (Freelancer/Client)
- [ ] Service plan creation
- [ ] Service browsing and search
- [ ] Order placement workflow
- [ ] Real-time chat system

### Phase 3: Payments
- [ ] Razorpay/Stripe integration
- [ ] Escrow system
- [ ] Withdrawal management
- [ ] Invoice generation

### Phase 4: Admin & Polish
- [ ] Admin dashboard
- [ ] User management
- [ ] Order management
- [ ] Analytics and reporting

### Phase 5: Launch
- [ ] Testing and QA
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Documentation

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint

# Supabase (if using Supabase CLI)
npx supabase init    # Initialize Supabase locally
npx supabase start   # Start local Supabase
```

## 📖 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Complete setup instructions
- [Project Specification](../INNFILL_PROJECT_SPECIFICATION.md) - Detailed project specs
- [Database Schema](./supabase/migrations/001_initial_schema.sql) - Database structure

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI Components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-First CSS Framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ by the INNFILL team
