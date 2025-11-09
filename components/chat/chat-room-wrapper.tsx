"use client";

import { useEffect, useState } from "react";
import { ChatRoom } from "./chat-room";
import { checkAndCloseChatRoom } from "@/lib/actions/chat";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircleIcon, ClockIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatRoomWrapperProps {
  roomId: string;
  currentUserId: string;
  isActive: boolean;
}

export function ChatRoomWrapper({ roomId, currentUserId, isActive }: ChatRoomWrapperProps) {
  const [showClosureNotice, setShowClosureNotice] = useState(false);
  const [isClosed, setIsClosed] = useState(!isActive);
  const [closeTime, setCloseTime] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkClosure = async () => {
      const result = await checkAndCloseChatRoom(roomId);
      
      if (result.success) {
        if (result.shouldClose) {
          setIsClosed(true);
          setShowClosureNotice(true);
        } else if (result.closeTime) {
          setCloseTime(result.closeTime);
        }
      }
    };

    checkClosure();
    
    // Check every minute for auto-closure
    const interval = setInterval(checkClosure, 60000);
    
    return () => clearInterval(interval);
  }, [roomId]);

  const getTimeRemaining = () => {
    if (!closeTime) return null;
    
    const now = new Date();
    const close = new Date(closeTime);
    const diff = close.getTime() - now.getTime();
    
    if (diff <= 0) return "Closing soon...";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Chat will close in ${hours}h ${minutes}m`;
    }
    return `Chat will close in ${minutes} minutes`;
  };

  return (
    <>
      {/* Closure Notice Popup */}
      <AnimatePresence>
        {showClosureNotice && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowClosureNotice(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-full">
                        <AlertCircleIcon className="w-6 h-6 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Chat Room Closed</h3>
                    </div>
                    <button
                      onClick={() => setShowClosureNotice(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <p className="text-gray-300">
                    This chat room has been automatically closed 24 hours after order completion.
                  </p>
                  
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-sm text-gray-400">
                      The order has been completed and the chat is no longer active. 
                      If you need further assistance, please create a new order.
                    </p>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => router.push('/orders')}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all font-semibold"
                    >
                      View Orders
                    </button>
                    <button
                      onClick={() => setShowClosureNotice(false)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Warning Banner if closing soon */}
      {!isClosed && closeTime && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-300">
                {getTimeRemaining()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This chat will automatically close 24 hours after order completion
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chat Room Component */}
      {isClosed ? (
        <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-black via-gray-900 to-black rounded-b-2xl">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-gray-800/50 rounded-full">
              <AlertCircleIcon className="w-12 h-12 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">Chat Room Closed</h3>
              <p className="text-gray-500">
                This chat is no longer active
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ChatRoom roomId={roomId} currentUserId={currentUserId} />
      )}
    </>
  );
}
