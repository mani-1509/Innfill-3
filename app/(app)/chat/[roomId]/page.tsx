import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChatRoom } from "@/lib/actions/chat";
import { ChatRoom } from "@/components/chat/chat-room";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, PackageIcon, CalendarIcon, DollarSignIcon, UserIcon } from "lucide-react";
import Link from "next/link";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get chat room details
  const result = await getChatRoom(roomId);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="py-12 text-center">
            <p className="text-gray-400 text-lg">
              {result.error || "Chat room not found"}
            </p>
            <Link 
              href="/orders" 
              className="mt-6 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Orders
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chatRoom = result.data;

  // Verify user is a participant
  if (
    chatRoom.participant_1_id !== user.id &&
    chatRoom.participant_2_id !== user.id
  ) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="max-w-md w-full bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="py-12 text-center">
            <p className="text-gray-400 text-lg">
              You are not authorized to view this chat room
            </p>
            <Link 
              href="/orders" 
              className="mt-6 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Orders
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine the other participant
  const otherParticipant =
    chatRoom.participant_1_id === user.id
      ? chatRoom.participant_2
      : chatRoom.participant_1;

  const displayName = otherParticipant?.display_name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/orders/${chatRoom.order_id}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Order
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-b border-white/10 p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-500/30">
                      <AvatarImage
                        src={otherParticipant?.avatar_url || ""}
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full ring-2 ring-black"></div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white">{displayName}</h2>
                    <p className="text-sm text-gray-400">
                      {chatRoom.order?.service_plan?.title || "Order Chat"}
                    </p>
                  </div>
                  {chatRoom.is_active ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                      Closed
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Chat Messages */}
              <ChatRoom roomId={roomId} currentUserId={user.id} />
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <PackageIcon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold">Order Details</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Service</p>
                  <p className="font-medium text-gray-200">
                    {chatRoom.order?.service_plan?.title || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Order ID</p>
                  <p className="text-sm font-mono text-gray-400 bg-white/5 px-3 py-2 rounded-lg">
                    {chatRoom.order_id.slice(0, 8)}...
                  </p>
                </div>

                <Link
                  href={`/orders/${chatRoom.order_id}`}
                  className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 font-medium"
                >
                  View Full Order
                </Link>

                <div className="border-t border-white/10 pt-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Participants</p>
                  <div className="space-y-3">
                    {/* Participant 1 */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Avatar className="h-10 w-10 ring-2 ring-white/10">
                        <AvatarImage
                          src={chatRoom.participant_1?.avatar_url || ""}
                          alt={chatRoom.participant_1?.display_name || ""}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm">
                          {(chatRoom.participant_1?.display_name || "U")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {chatRoom.participant_1?.display_name || "User"}
                        </p>
                        {chatRoom.participant_1_id === user.id && (
                          <span className="text-xs text-blue-400">You</span>
                        )}
                      </div>
                    </div>

                    {/* Participant 2 */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Avatar className="h-10 w-10 ring-2 ring-white/10">
                        <AvatarImage
                          src={chatRoom.participant_2?.avatar_url || ""}
                          alt={chatRoom.participant_2?.display_name || ""}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-sm">
                          {(chatRoom.participant_2?.display_name || "U")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {chatRoom.participant_2?.display_name || "User"}
                        </p>
                        {chatRoom.participant_2_id === user.id && (
                          <span className="text-xs text-blue-400">You</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
