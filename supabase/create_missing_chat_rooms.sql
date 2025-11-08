-- Create Chat Rooms for Existing Accepted Orders
-- Run this in Supabase SQL Editor if you have orders that were accepted before the chat system was implemented

-- This will create chat rooms for all accepted orders that don't have one yet
INSERT INTO chat_rooms (order_id, participant_1_id, participant_2_id, is_active, created_at)
SELECT 
  o.id as order_id,
  o.client_id as participant_1_id,
  o.freelancer_id as participant_2_id,
  true as is_active,
  NOW() as created_at
FROM orders o
WHERE o.status IN ('accepted', 'in_progress', 'delivered', 'revision_requested', 'completed')
  AND NOT EXISTS (
    SELECT 1 FROM chat_rooms cr WHERE cr.order_id = o.id
  );

-- Check how many chat rooms were created
SELECT COUNT(*) as chat_rooms_created FROM chat_rooms;

-- View the newly created chat rooms with order details
SELECT 
  cr.id as chat_room_id,
  o.id as order_id,
  o.status as order_status,
  sp.title as service_title,
  p1.display_name as client_name,
  p2.display_name as freelancer_name,
  cr.created_at as chat_created_at
FROM chat_rooms cr
JOIN orders o ON cr.order_id = o.id
JOIN service_plans sp ON o.service_plan_id = sp.id
JOIN profiles p1 ON cr.participant_1_id = p1.id
JOIN profiles p2 ON cr.participant_2_id = p2.id
ORDER BY cr.created_at DESC;
