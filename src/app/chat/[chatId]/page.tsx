"use client";

import {
  Box,
  Flex,
  Input,
  IconButton,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Avatar,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
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

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

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
    <Flex h="calc(100vh - 64px)" overflow="hidden">
      {/* Chat list sidebar */}
      <Box
        w="300px"
        borderRight="1px"
        borderColor={borderColor}
        p={4}
        overflowY="auto"
      >
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Your Chats
        </Text>
        <VStack spacing={3} align="stretch">
          {chatRooms.map((room) => (
            <Box
              key={room.id}
              p={3}
              bg={room.id === parseInt(chatId) ? "blue.50" : bg}
              borderRadius="md"
              cursor="pointer"
              onClick={() => router.push(`/chat/${room.id}`)}
            >
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  src={isExpert ? room.user.image : room.expert.image}
                  name={isExpert ? room.user.name : room.expert.name}
                />
                <Box>
                  <Text fontWeight="semibold">
                    {isExpert ? room.user.name : room.expert.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {room.status}
                  </Text>
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Chat area */}
      <Flex flex="1" direction="column">
        {/* Chat header */}
        <HStack p={4} borderBottom="1px" borderColor={borderColor} spacing={4}>
          <Avatar
            size="sm"
            src={isExpert ? chatRoom.user.image : chatRoom.expert.image}
            name={isExpert ? chatRoom.user.name : chatRoom.expert.name}
          />
          <Box flex="1">
            <Text fontWeight="bold">
              {isExpert ? chatRoom.user.name : chatRoom.expert.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {chatRoom.status}
            </Text>
          </Box>
          {isExpert && chatRoom.status === "ACTIVE" && (
            <Button colorScheme="green" size="sm" onClick={markAsResolved}>
              Mark as Resolved
            </Button>
          )}
        </HStack>

        {/* Messages area */}
        <VStack flex="1" overflowY="auto" p={4} spacing={4} align="stretch">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === parseInt(session.user.id);

            return (
              <Box
                key={message.id}
                alignSelf={isOwnMessage ? "flex-end" : "flex-start"}
                maxW="70%"
              >
                <HStack
                  spacing={2}
                  bg={isOwnMessage ? "blue.100" : "gray.100"}
                  p={3}
                  borderRadius="lg"
                >
                  <Avatar
                    size="xs"
                    src={message.sender.image}
                    name={message.sender.name}
                  />
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      {message.sender.name}
                    </Text>
                    <Text>{message.content}</Text>
                  </Box>
                </HStack>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </VStack>

        {/* Message input */}
        {chatRoom.status === "ACTIVE" && (
          <form onSubmit={sendMessage}>
            <HStack p={4} borderTop="1px" borderColor={borderColor}>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <IconButton
                type="submit"
                aria-label="Send message"
                icon={<FaPaperPlane />}
                colorScheme="blue"
              />
            </HStack>
          </form>
        )}
      </Flex>

      {/* Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rate your consultation</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={2}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    aria-label={`Rate ${star} stars`}
                    icon={<FaStar />}
                    color={star <= rating ? "yellow.400" : "gray.200"}
                    onClick={() => setRating(star)}
                  />
                ))}
              </HStack>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review (optional)"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={submitReview}>
              Submit Review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
