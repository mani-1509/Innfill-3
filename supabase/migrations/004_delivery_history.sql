-- Delivery History Table
-- Tracks all delivery submissions including revisions

CREATE TABLE IF NOT EXISTS delivery_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES profiles(id),
  version INTEGER NOT NULL, -- 1, 2, 3, etc. (increments with each resubmission)
  message TEXT,
  delivery_files TEXT[],
  delivery_links TEXT[],
  status TEXT NOT NULL CHECK (status IN ('delivered', 'revision_requested', 'approved')),
  revision_message TEXT, -- If status is revision_requested, store client's feedback
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_delivery_history_order ON delivery_history(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_history_created ON delivery_history(created_at);

-- Enable RLS
ALTER TABLE delivery_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view delivery history for orders they're part of
CREATE POLICY "Users can view delivery history for their orders"
  ON delivery_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = delivery_history.order_id
      AND (orders.client_id = auth.uid() OR orders.freelancer_id = auth.uid())
    )
  );

-- RLS Policy: Freelancers can insert delivery history
CREATE POLICY "Freelancers can create delivery history"
  ON delivery_history FOR INSERT
  WITH CHECK (
    auth.uid() = freelancer_id
  );

-- Function to automatically create delivery history entry when order is delivered
CREATE OR REPLACE FUNCTION create_delivery_history()
RETURNS TRIGGER AS $$
DECLARE
  current_version INTEGER;
BEGIN
  -- Only create history when status changes to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Get the next version number
    SELECT COALESCE(MAX(version), 0) + 1 INTO current_version
    FROM delivery_history
    WHERE order_id = NEW.id;
    
    -- Insert into delivery history
    INSERT INTO delivery_history (
      order_id,
      freelancer_id,
      version,
      message,
      delivery_files,
      delivery_links,
      status,
      created_at
    ) VALUES (
      NEW.id,
      NEW.freelancer_id,
      current_version,
      NEW.delivery_message,
      NEW.delivery_files,
      NEW.delivery_links,
      'delivered',
      NEW.delivered_at
    );
  END IF;
  
  -- Update delivery history when revision is requested
  IF NEW.status = 'revision_requested' AND OLD.status = 'delivered' THEN
    -- Update the latest delivery to revision_requested status
    UPDATE delivery_history
    SET 
      status = 'revision_requested',
      revision_message = NEW.delivery_message -- Store revision feedback
    WHERE order_id = NEW.id
    AND version = (
      SELECT MAX(version)
      FROM delivery_history
      WHERE order_id = NEW.id
    );
  END IF;
  
  -- Update delivery history when order is completed
  IF NEW.status = 'completed' AND OLD.status = 'delivered' THEN
    -- Update the latest delivery to approved status
    UPDATE delivery_history
    SET status = 'approved'
    WHERE order_id = NEW.id
    AND version = (
      SELECT MAX(version)
      FROM delivery_history
      WHERE order_id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create delivery history
CREATE TRIGGER on_order_delivery_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_delivery_history();

-- Migrate existing deliveries to delivery_history
INSERT INTO delivery_history (order_id, freelancer_id, version, message, delivery_files, delivery_links, status, created_at)
SELECT 
  id,
  freelancer_id,
  1, -- First version
  delivery_message,
  delivery_files,
  delivery_links,
  CASE 
    WHEN status = 'completed' THEN 'approved'
    WHEN status = 'revision_requested' THEN 'revision_requested'
    ELSE 'delivered'
  END,
  delivered_at
FROM orders
WHERE delivered_at IS NOT NULL
ON CONFLICT DO NOTHING;
