-- INNFILL Database Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('freelancer', 'client', 'admin')),
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  company_name TEXT,
  skills TEXT[],
  payment_account_type TEXT,
  payment_account_details JSONB,
  gst_number TEXT,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Plans Table
CREATE TABLE IF NOT EXISTS service_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
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
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id),
  freelancer_id UUID REFERENCES profiles(id),
  service_plan_id UUID REFERENCES service_plans(id),
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('basic', 'standard', 'premium')),
  requirements TEXT,
  requirement_files TEXT[],
  price DECIMAL(10,2) NOT NULL,
  delivery_days INTEGER NOT NULL,
  revisions_allowed INTEGER NOT NULL,
  revisions_used INTEGER DEFAULT 0,
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
  delivery_message TEXT,
  delivery_files TEXT[],
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accept_deadline TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Chat Rooms Table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  participant_1_id UUID REFERENCES profiles(id),
  participant_2_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
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

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  payment_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_plans_freelancer ON service_plans(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_service_plans_category ON service_plans(category);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_freelancer ON orders(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_plans_updated_at BEFORE UPDATE ON service_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for Service Plans
CREATE POLICY "Service plans are viewable by everyone"
  ON service_plans FOR SELECT
  USING (is_active = true OR freelancer_id = auth.uid());

CREATE POLICY "Freelancers can create service plans"
  ON service_plans FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can update own service plans"
  ON service_plans FOR UPDATE
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can delete own service plans"
  ON service_plans FOR DELETE
  USING (auth.uid() = freelancer_id);

-- RLS Policies for Orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = client_id OR 
    auth.uid() = freelancer_id
  );

CREATE POLICY "Clients can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Order participants can update orders"
  ON orders FOR UPDATE
  USING (
    auth.uid() = client_id OR 
    auth.uid() = freelancer_id
  );

-- RLS Policies for Chat Rooms
CREATE POLICY "Users can view own chat rooms"
  ON chat_rooms FOR SELECT
  USING (
    auth.uid() = participant_1_id OR 
    auth.uid() = participant_2_id
  );

-- RLS Policies for Messages
CREATE POLICY "Users can view messages in their rooms"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = messages.room_id
      AND (
        chat_rooms.participant_1_id = auth.uid() OR 
        chat_rooms.participant_2_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can send messages in their rooms"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = room_id
      AND (
        chat_rooms.participant_1_id = auth.uid() OR 
        chat_rooms.participant_2_id = auth.uid()
      )
    )
  );

-- RLS Policies for Notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    auth.uid() = client_id OR 
    auth.uid() = freelancer_id
  );

-- RLS Policies for Withdrawals
CREATE POLICY "Freelancers can view own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can create withdrawal requests"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);
