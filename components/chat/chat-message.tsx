"use client";

import { Message, getSignedChatAttachmentUrls } from "@/lib/actions/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { FileIcon, DownloadIcon, CheckCheckIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(true);

  const displayName = message.sender?.display_name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Fetch signed URLs for attachments
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (message.attachments && message.attachments.length > 0) {
        setLoadingUrls(true);
        const result = await getSignedChatAttachmentUrls(message.attachments);
        setSignedUrls(result.urls);
        setLoadingUrls(false);
      } else {
        setLoadingUrls(false);
      }
    };

    fetchSignedUrls();
  }, [message.attachments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"} mb-6`}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-white/10">
        <AvatarImage src={message.sender?.avatar_url || ""} alt={displayName} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%] min-w-[120px]`}>
        {/* Sender Name and Timestamp */}
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-sm font-semibold text-gray-200">
              {displayName}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-md ${
            isOwn
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm"
              : "bg-white/10 backdrop-blur-sm text-gray-100 border border-white/10 rounded-tl-sm"
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Loading Attachments */}
          {loadingUrls && message.attachments && message.attachments.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading attachments...
              </div>
            </div>
          )}

          {/* Attachments */}
          {!loadingUrls && signedUrls.length > 0 && (
            <div className="mt-3 space-y-2">
              {signedUrls.map((signedUrl, index) => {
                if (!signedUrl) return null;
                
                const isImage = signedUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
                const originalUrl = message.attachments?.[index] || signedUrl;
                const fileName = originalUrl.split('/').pop()?.split('-').slice(1).join('-') || `Attachment ${index + 1}`;
                
                if (isImage) {
                  return (
                    <a
                      key={index}
                      href={signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <img
                        src={signedUrl}
                        alt="Attachment"
                        className="max-w-full max-h-64 rounded-lg border border-white/20 group-hover:border-white/40 transition-all cursor-pointer"
                        onError={(e) => {
                          console.error('Failed to load image:', originalUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </a>
                  );
                }

                return (
                  <a
                    key={index}
                    href={signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2.5 text-sm py-2 px-3 rounded-lg transition-all ${
                      isOwn 
                        ? "bg-white/10 hover:bg-white/20 text-white" 
                        : "bg-black/20 hover:bg-black/30 text-gray-200"
                    }`}
                  >
                    <FileIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{fileName}</span>
                    <DownloadIcon className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Timestamp and Read Status */}
        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {isOwn && message.is_read && (
            <CheckCheckIcon className="h-3.5 w-3.5 text-blue-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
