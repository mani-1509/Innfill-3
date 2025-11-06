# INNFILL - Freelance Marketplace Platform: Complete Development Specification

## Project Overview
Build a simplified freelance marketplace platform called INNFILL that connects freelancers with clients through a clean, modern interface. Focus on simplicity and essential features without overwhelming complexity.

---

## 1. DESIGN SYSTEM & UI/UX

### Color Scheme & Theme
- **Primary Colors**: Black (#000000) and White (#FFFFFF)
- **Accent Colors**: 
  - Primary Accent: #3B82F6 (Blue) for CTAs and highlights
  - Success: #10B981 (Green)
  - Warning: #F59E0B (Amber)
  - Error: #EF4444 (Red)
- **Gray Scale**: Use Tailwind's gray palette for borders, backgrounds, and text hierarchy
- **Design Style**: Modern, clean, minimalist with ample white space

### Typography
- Use system fonts or Inter/Geist for clean, modern look
- Clear hierarchy: H1, H2, H3 for headings
- Body text: 16px base size
- Responsive scaling for mobile

### Layout Principles
- Mobile-first approach with desktop optimization
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Maximum content width: 1400px on desktop
- Consistent padding/spacing using Tailwind spacing scale

### Key UI Components to Design

#### Navigation
- Fixed header with logo, search bar, and user menu
- Mobile: Hamburger menu with slide-out drawer
- Desktop: Horizontal navigation with dropdowns

#### Cards
- **Service Plan Cards**: Image, title, description, pricing, freelancer info, "View Details" CTA
- **Profile Cards**: Avatar, name, rating, skills, "Contact" button
- **Order Cards**: Status badge, timeline, action buttons

#### Forms
- Clean input fields with labels and validation states
- File upload with drag-and-drop support
- Multi-step forms for service creation

#### Modals
- Order confirmation
- Delivery submission (with file upload)
- Revision requests
- Chat window

#### Dashboard Layouts
- **Freelancer Dashboard**: Stats cards, active orders, earnings overview
- **Client Dashboard**: Active orders, saved freelancers, order history
- **Admin Dashboard**: User management, platform stats, order monitoring

---

## 2. USER ROLES & PERMISSIONS

### Freelancer
- Create and manage service plans
- Accept/decline orders within 24 hours
- Submit deliverables with files and text
- Chat with clients
- View earnings and payment history
- Manage profile and portfolio

### Client
- Browse and search service plans
- Message freelancers before purchasing
- Purchase service plans with custom requirements
- Review deliverables
- Mark orders as complete
- Chat with freelancers
- Manage profile

### Admin
- View all users, orders, and transactions
- Moderate content
- Handle disputes
- View platform analytics
- Manage system settings

---

## 3. CORE FEATURES & USER FLOWS

### Authentication System
- Email/Password registration and login
- Email verification
- Password reset functionality
- Role selection during signup (Freelancer/Client)
- Protected routes based on authentication and role

### User Profiles

#### Freelancer Profile
- Profile picture
- Display name
- Bio/Description
- Skills/Categories
- Portfolio items (optional)
- Rating and reviews (future)
- Payment details (bank account, UPI, etc.)
- Service plans list

#### Client Profile
- Profile picture
- Display name
- Company name (optional)
- Bio
- Order history

### Service Plan System

#### Plan Creation (Freelancer)
- Service title
- Category/Tags
- Description
- Pricing tiers (Basic/Standard/Premium)
- Each tier includes:
  - Price
  - Delivery time
  - Number of revisions
  - Features/Deliverables
  - Any additional specifications
- Images/Gallery for service showcase

#### Plan Discovery (Client)
- Homepage with featured services
- Search functionality (by keyword, category)
- Filters:
  - Price range
  - Delivery time
  - Category
  - Rating (future)
- Sort by: Relevance, Price (low to high, high to low), Newest

### Order Workflow

#### Step 1: Pre-Purchase
- Client can message freelancer before buying
- Real-time chat for questions

#### Step 2: Purchase
- Client selects a plan tier
- Client provides order requirements (text + optional files)
- Payment processing
- Order created with "Pending Acceptance" status

#### Step 3: Order Acceptance (24-hour window)
- Freelancer receives notification
- Freelancer can:
  - **Accept**: Order status → "In Progress", chat opens
  - **Decline**: Order cancelled, refund processed (if applicable)
- Auto-decline if no action within 24 hours

#### Step 4: Work in Progress
- Chat room automatically opens between freelancer and client
- Both can exchange messages and files
- Real-time messaging

#### Step 5: Delivery Submission
- Freelancer submits work:
  - Delivery message/notes
  - File attachments (multiple files supported)
- Client receives notification
- Order status → "Under Review"

#### Step 6: Client Review
- Client can:
  - **Accept Delivery**: Order status → "Completed", chat closes
  - **Request Revision**: Order status → "Revision Requested" (if revisions available)
- No revision request option - direct completion after review

#### Step 7: Order Completion
- Order marked as completed
- Chat room closes/archives
- Payment released to freelancer
- Platform fee deducted

### Chat System

#### Order-Specific Chat
- Opens when order is accepted
- Closes when order is completed
- Supports:
  - Text messages
  - File sharing
  - Real-time updates
  - Read receipts
  - Message history

#### General Chat (Pre-Purchase)
- Clients can message any freelancer
- Freelancers can respond
- Separate from order chats
- Accessible from profile page

### Notification System
- Real-time notifications for:
  - New order (Freelancer)
  - Order accepted/declined (Client)
  - New message (Both)
  - Delivery submitted (Client)
  - Revision requested (Freelancer)
  - Order completed (Both)
  - Payment received (Freelancer)
- In-app notification bell with dropdown
- Email notifications (optional)

### Payment System

#### For Clients
- Payment gateway integration (Stripe/Razorpay)
- Payment escrow until order completion
- Payment history
- Invoice generation

#### For Freelancers
- Payment details management (bank account/UPI)
- Earnings dashboard
- Withdrawal system
- Platform fee deduction (e.g., 10-20%)
- Payment history
- Tax information (GST details)

### Search & Discovery
- Global search bar in header
- Search by:
  - Service name
  - Freelancer name
  - Keywords in description
  - Category tags
- Filter panel:
  - Price range slider
  - Delivery time (1 day, 3 days, 7 days, etc.)
  - Category checkboxes
- Sort options dropdown
- Results displayed in grid layout

### Admin Panel

#### Dashboard
- Total users (Freelancers/Clients)
- Total orders (Active/Completed/Cancelled)
- Revenue statistics
- Platform growth charts

#### User Management
- List all users with filters
- View user details
- Suspend/Activate accounts
- View user activity

#### Order Management
- List all orders with status filters
- View order details
- Handle disputes
- Issue refunds

#### Content Moderation
- Review reported services
- Review reported users
- Moderate chat messages (if flagged)

#### Settings
- Platform fee configuration
- Email template management
- System announcements

---

## 4. TECHNICAL ARCHITECTURE

### Frontend (Next.js 14+ with App Router)

#### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui or Headless UI
- **State Management**: React Query (TanStack Query) for server state
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Supabase Realtime
- **File Upload**: Supabase Storage

#### Folder Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   ├── freelancer/
│   │   │   └── client/
│   │   ├── services/
│   │   │   ├── [id]/
│   │   │   └── create/
│   │   ├── orders/
│   │   │   └── [id]/
│   │   ├── chat/
│   │   │   └── [roomId]/
│   │   ├── profile/
│   │   │   └── [userId]/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── orders/
│   │   └── settings/
│   └── api/
│       ├── auth/
│       ├── orders/
│       ├── payments/
│       └── webhooks/
├── components/
│   ├── ui/ (base components)
│   ├── forms/
│   ├── modals/
│   ├── dashboard/
│   └── chat/
├── lib/
│   ├── supabase/
│   ├── actions/
│   ├── hooks/
│   ├── utils/
│   └── validations/
└── types/
```

### Backend (Supabase)

#### Database Schema

```sql
-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('freelancer', 'client', 'admin')),
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  company_name TEXT, -- for clients
  skills TEXT[], -- for freelancers
  -- Payment details for freelancers
  payment_account_type TEXT, -- 'bank', 'upi', 'paypal'
  payment_account_details JSONB,
  gst_number TEXT,
  -- Stats
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Plans
CREATE TABLE service_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  -- Pricing tiers
  basic_price DECIMAL(10,2),
  basic_delivery_days INTEGER,
  basic_revisions INTEGER,
  basic_features TEXT[],
  standard_price DECIMAL(10,2),
  standard_delivery_days INTEGER,
  standard_revisions INTEGER,
  standard_features TEXT[],
  premium_price DECIMAL(10,2),
  premium_delivery_days INTEGER,
  premium_revisions INTEGER,
  premium_features TEXT[],
  -- Stats
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id),
  freelancer_id UUID REFERENCES profiles(id),
  service_plan_id UUID REFERENCES service_plans(id),
  -- Order details
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('basic', 'standard', 'premium')),
  requirements TEXT,
  requirement_files TEXT[],
  -- Pricing from selected tier
  price DECIMAL(10,2) NOT NULL,
  delivery_days INTEGER NOT NULL,
  revisions_allowed INTEGER NOT NULL,
  revisions_used INTEGER DEFAULT 0,
  -- Status tracking
  status TEXT NOT NULL CHECK (status IN (
    'pending_acceptance',
    'accepted',
    'in_progress',
    'delivered',
    'revision_requested',
    'completed',
    'cancelled',
    'declined'
  )),
  -- Delivery
  delivery_message TEXT,
  delivery_files TEXT[],
  delivered_at TIMESTAMPTZ,
  -- Completion
  completed_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Auto-decline after 24 hours
  accept_deadline TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Chat Rooms
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  participant_1_id UUID REFERENCES profiles(id),
  participant_2_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  client_id UUID REFERENCES profiles(id),
  freelancer_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  freelancer_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_gateway_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawals
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  payment_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Row Level Security (RLS) Policies
- Enable RLS on all tables
- Users can only read/update their own profile
- Service plans visible to all, editable only by owner
- Orders accessible only to involved parties (client/freelancer) and admins
- Messages accessible only to chat room participants
- Notifications accessible only to the recipient
- Admin role has elevated permissions

#### Storage Buckets
- **avatars**: User profile pictures
- **service-images**: Service plan showcase images
- **order-files**: Order requirements and deliverables
- **chat-attachments**: Files shared in chat

#### Real-time Subscriptions
- Chat messages (new messages in active room)
- Notifications (new notifications for user)
- Order status updates

#### Database Functions & Triggers
- Auto-update `updated_at` timestamps
- Auto-create chat room when order is accepted
- Auto-close chat room when order is completed
- Auto-decline order after 24 hours if no action
- Calculate platform fees and freelancer earnings
- Update freelancer stats on order completion

---

## 5. API ENDPOINTS & SERVER ACTIONS

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

### Profiles
- `GET /api/profiles/[id]` - Get profile
- `PUT /api/profiles/[id]` - Update profile
- `GET /api/profiles/freelancers` - List freelancers

### Service Plans
- `GET /api/services` - List/search services
- `GET /api/services/[id]` - Get service details
- `POST /api/services` - Create service (freelancer only)
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### Orders
- `POST /api/orders` - Create order (purchase)
- `GET /api/orders` - List user orders
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]/accept` - Accept order (freelancer)
- `PUT /api/orders/[id]/decline` - Decline order (freelancer)
- `PUT /api/orders/[id]/deliver` - Submit delivery (freelancer)
- `PUT /api/orders/[id]/complete` - Complete order (client)
- `PUT /api/orders/[id]/request-revision` - Request revision (client)

### Chat
- `GET /api/chat/rooms` - Get user's chat rooms
- `GET /api/chat/rooms/[id]/messages` - Get messages
- `POST /api/chat/rooms/[id]/messages` - Send message

### Payments
- `POST /api/payments/process` - Process payment
- `POST /api/payments/webhooks` - Payment gateway webhooks
- `POST /api/withdrawals` - Request withdrawal (freelancer)
- `GET /api/payments/history` - Payment history

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/[id]/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]/suspend` - Suspend user
- `GET /api/admin/orders` - List all orders

---

## 6. KEY FEATURES IMPLEMENTATION DETAILS

### File Upload System
- Use Supabase Storage
- Implement drag-and-drop interface
- File type restrictions (images: jpg, png, pdf, documents: pdf, docx, etc.)
- Size limits (per file: 10MB, total: 50MB per upload)
- Progress indicators
- Preview thumbnails for images

### Real-time Chat
- Use Supabase Realtime for instant messaging
- Message status indicators (sent, delivered, read)
- File attachment support
- Auto-scroll to latest message
- Typing indicators (optional)
- Message timestamps

### Search & Filtering
- Full-text search on service titles and descriptions
- Category filtering with multi-select
- Price range slider
- Debounced search input
- Pagination (infinite scroll or numbered pages)
- Search result count

### Notification System
- Bell icon with unread count badge
- Dropdown with recent notifications
- "Mark all as read" option
- Notification types:
  - `order_created` - New order for freelancer
  - `order_accepted` - Order accepted by freelancer
  - `order_declined` - Order declined by freelancer
  - `new_message` - New chat message
  - `delivery_submitted` - Work delivered
  - `order_completed` - Order completed
  - `payment_received` - Payment to freelancer
- Click notification to navigate to relevant page

### Payment Integration
- Integrate Razorpay or Stripe
- Escrow system: hold payment until order completion
- Platform fee calculation (configurable percentage)
- Automatic release on completion
- Refund handling for cancelled orders
- Invoice generation (PDF)

### Admin Dashboard
- Overview cards: Total users, orders, revenue
- Charts: Revenue over time, orders over time
- Recent activity feed
- User table with search and filters
- Order table with status filters
- Quick actions (suspend user, refund order)

---

## 7. SECURITY & VALIDATION

### Input Validation
- Use Zod schemas for all form inputs
- Server-side validation for all API endpoints
- Sanitize user inputs to prevent XSS
- File upload validation (type, size)

### Authentication & Authorization
- JWT-based authentication (Supabase Auth)
- Protected routes with middleware
- Role-based access control
- Session management

### Data Protection
- Enable RLS on all Supabase tables
- Encrypt sensitive data (payment details)
- HTTPS only
- CORS configuration
- Rate limiting on API endpoints

---

## 8. DEPLOYMENT & DEVOPS

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Deployment
- **Frontend**: Vercel (automatic deployments from Git)
- **Backend**: Supabase (managed)
- **Domain**: Custom domain configuration
- **SSL**: Automatic via Vercel/Supabase

### Performance Optimization
- Next.js Image optimization
- Route-based code splitting
- Lazy loading for modals and heavy components
- Caching strategies (React Query)
- Database indexing on frequently queried columns

---

## 9. TESTING & QUALITY ASSURANCE

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual testing checklist

### Key Flows to Test
1. User registration and login
2. Service plan creation
3. Order placement
4. Order acceptance/decline
5. Chat functionality
6. Delivery submission
7. Order completion
8. Payment processing
9. Withdrawal request
10. Admin operations

---

## 10. FUTURE ENHANCEMENTS (Post-MVP)

- Rating and review system
- Gamification (badges, levels)
- Freelancer verification
- Social media integration
- Advanced analytics for freelancers
- Dispute resolution system
- Saved/favorite services
- Coupon/promo codes
- Multi-currency support
- Email notifications (transactional emails)
- Mobile app (React Native)

---

## DEVELOPMENT TIMELINE ESTIMATE

### Phase 1: Foundation (Week 1-2)
- Set up Next.js project
- Configure Supabase
- Implement authentication
- Design system setup

### Phase 2: Core Features (Week 3-5)
- Profile management
- Service plan system
- Order workflow
- Chat system

### Phase 3: Payments (Week 6)
- Payment gateway integration
- Escrow system
- Withdrawal system

### Phase 4: Admin & Polish (Week 7-8)
- Admin panel
- Notifications
- Search & filters
- Bug fixes and optimization

### Phase 5: Testing & Deployment (Week 9-10)
- Comprehensive testing
- Performance optimization
- Production deployment
- Documentation

---

## USER STORIES

### Freelancer Stories
1. As a freelancer, I want to create service plans with different pricing tiers so clients can choose based on their budget
2. As a freelancer, I want to receive notifications when someone orders my service
3. As a freelancer, I want to accept or decline orders within 24 hours
4. As a freelancer, I want to chat with clients about order details
5. As a freelancer, I want to submit deliverables with files and descriptions
6. As a freelancer, I want to track my earnings and request withdrawals
7. As a freelancer, I want to manage my payment details securely

### Client Stories
1. As a client, I want to browse and search for services by category and price
2. As a client, I want to message freelancers before making a purchase
3. As a client, I want to provide detailed requirements when ordering
4. As a client, I want to receive notifications about order updates
5. As a client, I want to review deliverables and mark orders as complete
6. As a client, I want to chat with freelancers during the order
7. As a client, I want to see my order history

### Admin Stories
1. As an admin, I want to view platform statistics and metrics
2. As an admin, I want to manage users and suspend accounts if needed
3. As an admin, I want to view and manage all orders
4. As an admin, I want to handle disputes between users
5. As an admin, I want to configure platform fees

---

## ACCEPTANCE CRITERIA

### Authentication
- ✅ Users can register with email and password
- ✅ Email verification is required
- ✅ Users can log in and log out
- ✅ Password reset functionality works
- ✅ Protected routes redirect to login

### Service Plans
- ✅ Freelancers can create plans with 3 tiers
- ✅ Plans display correctly on homepage
- ✅ Search and filters work accurately
- ✅ Service detail page shows all information
- ✅ Only plan owner can edit/delete

### Orders
- ✅ Clients can place orders with requirements
- ✅ Freelancers receive order notifications
- ✅ 24-hour acceptance window is enforced
- ✅ Auto-decline works after 24 hours
- ✅ Chat opens when order is accepted
- ✅ Freelancers can submit deliverables
- ✅ Clients can complete orders
- ✅ Chat closes when order completes

### Chat
- ✅ Real-time messaging works
- ✅ File attachments can be sent
- ✅ Message history is preserved
- ✅ Unread indicators are accurate
- ✅ Only participants can access chat

### Payments
- ✅ Payment gateway integration works
- ✅ Escrow holds payment until completion
- ✅ Platform fee is calculated correctly
- ✅ Withdrawals can be requested
- ✅ Payment history is accurate

### Admin
- ✅ Dashboard shows accurate statistics
- ✅ User management functions work
- ✅ Order management functions work
- ✅ Only admins can access admin panel

---

## NOTES FOR DEVELOPERS

### Code Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Create feature branches for development

### Component Guidelines
- Keep components small and focused
- Use composition over prop drilling
- Implement proper error boundaries
- Add loading states for async operations
- Make components accessible (ARIA)

### Database Best Practices
- Use transactions for related operations
- Index frequently queried columns
- Use prepared statements
- Handle connection pooling
- Regular backups

### API Design
- RESTful conventions
- Consistent error responses
- Proper HTTP status codes
- Rate limiting
- API versioning (future)

---

This specification provides a complete blueprint for building the INNFILL freelance marketplace platform. Use this document as a reference throughout the development process.

**Last Updated**: November 6, 2025
**Version**: 1.0
