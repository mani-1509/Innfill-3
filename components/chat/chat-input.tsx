"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, PaperclipIcon, XIcon, ImageIcon, Loader2Icon } from "lucide-react";
import { sendMessage } from "@/lib/actions/chat";
import { uploadChatAttachment } from "@/lib/utils/upload-utils";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  roomId: string;
  onMessageSent?: () => void;
}

export function ChatInput({ roomId, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    setSending(true);
    try {
      let attachmentUrls: string[] = [];

      // Upload attachments if any
      if (attachments.length > 0) {
        setUploading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          for (const file of attachments) {
            const result = await uploadChatAttachment(file, user.id, roomId);
            if (result.success && result.url) {
              attachmentUrls.push(result.url);
            }
          }
        }
        setUploading(false);
      }
      
      // Send message
      const result = await sendMessage(roomId, message, attachmentUrls.length > 0 ? attachmentUrls : undefined);

      if (result.success) {
        setMessage("");
        setAttachments([]);
        onMessageSent?.();
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } else {
        alert(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="border-t border-white/10 bg-black/40 backdrop-blur-sm p-4">
      {/* Attachment Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {attachments.map((file, index) => {
              const preview = getFilePreview(file);
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative group"
                >
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 pr-8">
                    {preview ? (
                      <img 
                        src={preview} 
                        alt={file.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <PaperclipIcon className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-300 max-w-[150px] truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all shadow-lg"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading}
          className="flex-shrink-0 bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
        >
          <PaperclipIcon className="h-5 w-5" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-[150px] resize-none bg-white/5 border-white/10 text-gray-100 placeholder:text-gray-500 focus:bg-white/10 focus:border-blue-500/50 pr-12 rounded-xl"
            disabled={sending || uploading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {message.length > 0 && `${message.length} chars`}
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={(!message.trim() && attachments.length === 0) || sending || uploading}
          size="icon"
          className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending || uploading ? (
            <Loader2Icon className="h-5 w-5 animate-spin" />
          ) : (
            <SendIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {uploading && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-blue-400 mt-2 flex items-center gap-2"
          >
            <Loader2Icon className="h-3 w-3 animate-spin" />
            Uploading attachments...
          </motion.p>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-gray-400">Enter</kbd> to send, 
        <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-gray-400 ml-1">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
