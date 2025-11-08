"use client";

import { useEffect, useState, useRef } from "react";
import { Message, getMessages, markMessagesAsRead } from "@/lib/actions/chat";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { createClient } from "@/lib/supabase/client";
import { Loader2Icon, MessageSquareIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatRoomProps {
  roomId: string;
  currentUserId: string;
}

export function ChatRoom({ roomId, currentUserId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? "smooth" : "auto" 
    });
  };

  const fetchMessages = async () => {
    const result = await getMessages(roomId);
    if (result.success && result.data) {
      setMessages(result.data);
      setLoading(false);
      setTimeout(() => scrollToBottom(false), 100);
    }
  };

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead(roomId);
  }, [roomId]);

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the new message with sender details
          const result = await getMessages(roomId);
          if (result.success && result.data) {
            setMessages(result.data);
            setTimeout(() => scrollToBottom(true), 100);
            
            // Mark messages as read if not sent by current user
            if ((payload.new as any).sender_id !== currentUserId) {
              await markMessagesAsRead(roomId);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <Loader2Icon className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)`
        }}
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-gray-500"
            >
              <MessageSquareIcon className="h-16 w-16 mb-4 text-gray-700" />
              <p className="text-lg font-medium mb-2">No messages yet</p>
              <p className="text-sm text-gray-600">Start the conversation!</p>
            </motion.div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === currentUserId}
                />
              ))}
            </>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput roomId={roomId} onMessageSent={fetchMessages} />
    </div>
  );
}
