"use client";

import {
  Input,
  Avatar,
  Button,
  useToast,
  Modal,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState, useRef, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaPaperPlane, FaStar } from "react-icons/fa";

interface Message {
  id: number;
  content: string;
  senderId: number;
  createdAt: string;
  sender: {
    name: string;
    image: string;
  };
}

interface ChatRoom {
  id: number;
  expertId: number;
  userId: number;
  status: "ACTIVE" | "RESOLVED";
  expert: {
    name: string;
    image: string;
  };
  user: {
    name: string;
    image: string;
  };
}

interface PageParams {
  params: Promise<{ chatId: string }>;
}

export default function ChatRoomWrapper({ params }: PageParams) {
  const resolvedParams = use(params);
  return <ChatRoomContent chatId={resolvedParams.chatId} />;
}

function ChatRoomContent({ chatId }: { chatId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/signin");
      return;
    }

    fetchChatRooms();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [session, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatRooms = async () => {
    try {
      const response = await fetch("/api/chat/rooms");
      const data = await response.json();
      setChatRooms(data.chatRooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`);
      const data = await response.json();
      setMessages(data.messages);
      setChatRoom(data.chatRoom);

      if (data.chatRoom.status === "RESOLVED" && !data.hasReview) {
        onOpen();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markAsResolved = async () => {
    try {
      await fetch(`/api/chat/${chatId}/resolve`, {
        method: "POST",
      });
      fetchMessages();
      toast({
        title: "Chat marked as resolved",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error marking chat as resolved:", error);
    }
  };

  const submitReview = async () => {
    try {
      await fetch(`/api/chat/${chatId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: review }),
      });
      onClose();
      toast({
        title: "Review submitted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (!chatRoom || !session?.user) return null;

  const isExpert = session.user.role === "EXPERT";

  return (
    <div className="h-[calc(100vh-72px)] flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Chats</h2>
          <div className="space-y-3">
            {chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => router.push(`/chat/${room.id}`)}
                className={`w-full p-4 flex items-center space-x-4 rounded-xl transition
                  ${
                    room.id === parseInt(chatId)
                      ? "bg-pink-50 border-pink-100"
                      : "hover:bg-gray-50"
                  }`}
              >
                <Avatar
                  size="sm"
                  src={isExpert ? room.user.image : room.expert.image}
                  name={isExpert ? room.user.name : room.expert.name}
                />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">
                    {isExpert ? room.user.name : room.expert.name}
                  </p>
                  <p className="text-sm text-gray-500">{room.status}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Avatar
              size="sm"
              src={isExpert ? chatRoom.user.image : chatRoom.expert.image}
              name={isExpert ? chatRoom.user.name : chatRoom.expert.name}
            />
            <div>
              <p className="font-semibold text-gray-900">
                {isExpert ? chatRoom.user.name : chatRoom.expert.name}
              </p>
              <p className="text-sm text-gray-500">{chatRoom.status}</p>
            </div>
          </div>
          {isExpert && chatRoom.status === "ACTIVE" && (
            <Button
              onClick={markAsResolved}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-2"
            >
              Mark as Resolved
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === parseInt(session.user.id);
            return (
              <div
                key={message.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] flex items-start space-x-2
                  ${isOwnMessage ? "bg-pink-50" : "bg-gray-50"}
                  rounded-xl p-4`}
                >
                  <Avatar
                    size="xs"
                    src={message.sender.image}
                    name={message.sender.name}
                  />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {message.sender.name}
                    </p>
                    <p className="text-gray-900">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {chatRoom.status === "ACTIVE" && (
          <form onSubmit={sendMessage} className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
              />

              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2"
              >
                <FaPaperPlane className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <div className="bg-white p-6 space-y-6">
          <h3 className="text-xl font-bold text-gray-900">
            Rate your consultation
          </h3>
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  <FaStar
                    className={
                      star <= rating ? "text-yellow-400" : "text-gray-200"
                    }
                  />
                </button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review (optional)"
              className="w-full rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={submitReview}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6 py-2"
            >
              Submit Review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
