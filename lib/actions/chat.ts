"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Generate signed URLs for chat attachments
 */
export async function getSignedChatAttachmentUrls(attachments: string[]) {
  try {
    const supabase = await createClient();
    const signedUrls: string[] = [];

    for (const fileUrl of attachments) {
      try {
        // Extract bucket name and file path from the URL
        const urlParts = fileUrl.split('/storage/v1/object/');
        if (urlParts.length < 2) {
          signedUrls.push(fileUrl); // Return original if parsing fails
          continue;
        }

        const pathPart = urlParts[1].replace('public/', '');
        const [bucket, ...pathSegments] = pathPart.split('/');
        const filePath = pathSegments.join('/');

        // Generate signed URL (valid for 1 hour)
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 3600);

        if (error || !data) {
          console.error('Error generating signed URL:', error);
          signedUrls.push(fileUrl); // Return original on error
        } else {
          signedUrls.push(data.signedUrl);
        }
      } catch (err) {
        console.error('Error processing attachment URL:', err);
        signedUrls.push(fileUrl); // Return original on error
      }
    }

    return { urls: signedUrls };
  } catch (error) {
    console.error('Error in getSignedChatAttachmentUrls:', error);
    return { urls: attachments }; // Return originals on error
  }
}

export interface ChatRoom {
  id: string;
  order_id: string;
  participant_1_id: string;
  participant_2_id: string;
  is_active: boolean;
  last_message_at: string | null;
  created_at: string;
  order?: {
    id: string;
    service_plan: {
      id: string;
      title: string;
    };
  };
  participant_1?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  participant_2?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  attachments: string[] | null;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

/**
 * Create a new chat room for an order
 */
export async function createChatRoom(
  orderId: string,
  participant1Id: string,
  participant2Id: string
): Promise<{ success: boolean; data?: ChatRoom; error?: string }> {
  try {
    const supabase = await createClient();

    // Check if chat room already exists for this order
    const { data: existing } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (existing) {
      return { success: true, data: existing as ChatRoom };
    }

    // Create new chat room
    const { data, error } = await supabase
      .from("chat_rooms")
      .insert({
        order_id: orderId,
        participant_1_id: participant1Id,
        participant_2_id: participant2Id,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/chat");

    return { success: true, data: data as ChatRoom };
  } catch (error) {
    console.error("Error creating chat room:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create chat room",
    };
  }
}

/**
 * Get a chat room by ID with participants and order info
 */
export async function getChatRoom(
  roomId: string
): Promise<{ success: boolean; data?: ChatRoom; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chat_rooms")
      .select(
        `
        *,
        order:orders(
          id,
          service_plan:service_plans(id, title)
        ),
        participant_1:profiles!chat_rooms_participant_1_id_fkey(id, display_name, avatar_url),
        participant_2:profiles!chat_rooms_participant_2_id_fkey(id, display_name, avatar_url)
      `
      )
      .eq("id", roomId)
      .single();

    if (error) throw error;

    return { success: true, data: data as unknown as ChatRoom };
  } catch (error) {
    console.error("Error fetching chat room:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch chat room",
    };
  }
}

/**
 * Get chat room by order ID
 */
export async function getChatRoomByOrderId(
  orderId: string
): Promise<{ success: boolean; data?: ChatRoom; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("chat_rooms")
      .select(
        `
        *,
        order:orders(
          id,
          service_plan:service_plans(id, title)
        ),
        participant_1:profiles!chat_rooms_participant_1_id_fkey(id, display_name, avatar_url),
        participant_2:profiles!chat_rooms_participant_2_id_fkey(id, display_name, avatar_url)
      `
      )
      .eq("order_id", orderId)
      .maybeSingle();

    if (error) throw error;
    
    // Return success even if no data (chat room doesn't exist yet)
    if (!data) {
      return { success: true, data: undefined };
    }

    return { success: true, data: data as unknown as ChatRoom };
  } catch (error) {
    console.error("Error fetching chat room:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch chat room",
    };
  }
}

/**
 * Get all chat rooms for a user
 */
export async function getUserChatRooms(): Promise<{
  success: boolean;
  data?: ChatRoom[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("chat_rooms")
      .select(
        `
        *,
        order:orders(
          id,
          service_plan:service_plans(id, title)
        ),
        participant_1:profiles!chat_rooms_participant_1_id_fkey(id, display_name, avatar_url),
        participant_2:profiles!chat_rooms_participant_2_id_fkey(id, display_name, avatar_url)
      `
      )
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) throw error;

    return { success: true, data: (data as unknown as ChatRoom[]) || [] };
  } catch (error) {
    console.error("Error fetching user chat rooms:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch chat rooms",
    };
  }
}

/**
 * Send a message in a chat room
 */
export async function sendMessage(
  roomId: string,
  content: string,
  attachments?: string[]
): Promise<{ success: boolean; data?: Message; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Verify user is a participant in the chat room
    const { data: room } = await supabase
      .from("chat_rooms")
      .select("participant_1_id, participant_2_id")
      .eq("id", roomId)
      .single();

    if (!room) throw new Error("Chat room not found");
    if (
      room.participant_1_id !== user.id &&
      room.participant_2_id !== user.id
    ) {
      throw new Error("Not authorized to send messages in this chat room");
    }

    // Insert message
    const messageData: any = {
      room_id: roomId,
      sender_id: user.id,
      content: content.trim(),
    };
    
    // Only add attachments if they exist and are not empty
    if (attachments && attachments.length > 0) {
      messageData.attachments = attachments;
    }

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert(messageData)
      .select(
        `
        *,
        sender:profiles(id, display_name, avatar_url)
      `
      )
      .single();

    if (messageError) throw messageError;

    // Update chat room's last_message_at
    await supabase
      .from("chat_rooms")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", roomId);

    revalidatePath(`/chat/${roomId}`);

    return { success: true, data: message as unknown as Message };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

/**
 * Get messages in a chat room
 */
export async function getMessages(
  roomId: string,
  limit: number = 50
): Promise<{ success: boolean; data?: Message[]; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Verify user is a participant
    const { data: room } = await supabase
      .from("chat_rooms")
      .select("participant_1_id, participant_2_id")
      .eq("id", roomId)
      .single();

    if (!room) throw new Error("Chat room not found");
    if (
      room.participant_1_id !== user.id &&
      room.participant_2_id !== user.id
    ) {
      throw new Error("Not authorized to view messages in this chat room");
    }

    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles(id, display_name, avatar_url)
      `
      )
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: (data as unknown as Message[]) || [] };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch messages",
    };
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  roomId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Mark all unread messages in the room as read (except the user's own messages)
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("room_id", roomId)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    if (error) throw error;

    revalidatePath(`/chat/${roomId}`);

    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to mark messages as read",
    };
  }
}

/**
 * Get unread message count for a user
 */
export async function getUnreadMessageCount(): Promise<{
  success: boolean;
  data?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get all chat rooms for the user
    const { data: rooms } = await supabase
      .from("chat_rooms")
      .select("id")
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`);

    if (!rooms || rooms.length === 0) {
      return { success: true, data: 0 };
    }

    const roomIds = rooms.map((room) => room.id);

    // Count unread messages in all user's rooms (not sent by user)
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("room_id", roomIds)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    if (error) throw error;

    return { success: true, data: count || 0 };
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch unread message count",
    };
  }
}
