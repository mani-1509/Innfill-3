-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Each user can only rate once per order
  UNIQUE(order_id, from_user_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ratings_order_id ON ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_ratings_to_user_id ON ratings(to_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_from_user_id ON ratings(from_user_id);

-- Add rating count column to profiles (rating column already exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Function to update user rating stats (uses existing rating column)
CREATE OR REPLACE FUNCTION update_user_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user being rated with average rating
  UPDATE profiles
  SET 
    rating_count = (SELECT COUNT(*) FROM ratings WHERE to_user_id = NEW.to_user_id),
    rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
      FROM ratings 
      WHERE to_user_id = NEW.to_user_id
    )
  WHERE id = NEW.to_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic rating stats update
DROP TRIGGER IF EXISTS trigger_update_rating_stats ON ratings;
CREATE TRIGGER trigger_update_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_user_rating_stats();

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings for themselves"
  ON ratings FOR SELECT
  TO authenticated
  USING (to_user_id = auth.uid() OR from_user_id = auth.uid());

CREATE POLICY "Users can view all ratings (public profiles)"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ratings for their orders"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    from_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.status = 'completed'
      AND (orders.client_id = auth.uid() OR orders.freelancer_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own ratings within 24 hours"
  ON ratings FOR UPDATE
  TO authenticated
  USING (
    from_user_id = auth.uid() AND
    created_at > NOW() - INTERVAL '24 hours'
  )
  WITH CHECK (from_user_id = auth.uid());

-- Add comment
COMMENT ON TABLE ratings IS 'Stores user ratings and reviews for completed orders';
