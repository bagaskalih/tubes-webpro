"use client";

import { useEffect, useState, use } from "react";
import { Thread } from "@/types/forum";
import {
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  HStack,
  IconButton,
  Textarea,
  useToast,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Avatar,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaThumbsUp, FaThumbsDown, FaTrash } from "react-icons/fa";

enum ExpertSpecialty {
  NUTRISI_ANAK = "NUTRISI_ANAK",
  PSIKOLOGI_ANAK = "PSIKOLOGI_ANAK",
  PARENTING = "PARENTING",
  PERTUMBUHAN_ANAK = "PERTUMBUHAN_ANAK",
  EDUKASI_ANAK = "EDUKASI_ANAK",
}

const specialtyLabels: Record<ExpertSpecialty, string> = {
  NUTRISI_ANAK: "Nutrisi Anak",
  PSIKOLOGI_ANAK: "Psikologi Anak",
  PARENTING: "Parenting",
  PERTUMBUHAN_ANAK: "Pertumbuhan Anak",
  EDUKASI_ANAK: "Pendidikan Anak",
};

interface PageParams {
  params: Promise<{ threadId: string }>;
}

export default function ThreadPageWrapper({ params }: PageParams) {
  const resolvedParams = use(params);
  return <ThreadContent threadId={resolvedParams.threadId} />;
}

function ThreadContent({ threadId }: { threadId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [thread, setThread] = useState<Thread | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (!threadId) return;
    fetchThread();
  }, [threadId]);

  const fetchThread = async () => {
    try {
      const response = await fetch(`/api/forum/thread/${threadId}`);
      if (!response.ok) throw new Error("Thread not found");
      const data = await response.json();

      // Sort comments by like count before setting the thread
      const sortedThread = {
        ...data.thread,
        comments: [...data.thread.comments].sort(
          (a, b) => b._count.likes - a._count.likes
        ),
      };
      setThread(sortedThread);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching thread",
        status: "error",
        duration: 3000,
      });
      router.push("/forum");
    }
  };

  const handleDeleteThread = async () => {
    try {
      const response = await fetch(`/api/forum/thread/${threadId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete thread");

      toast({
        title: "Thread deleted successfully",
        status: "success",
        duration: 3000,
      });
      router.push("/forum");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error deleting thread",
        status: "error",
        duration: 3000,
      });
    } finally {
      onClose();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: "Please sign in to comment",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/forum/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          threadId: parseInt(threadId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.errors);
      }

      setNewComment("");
      fetchThread();
      toast({
        title: "Comment added successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: (error as Error).message || "Error adding comment",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: number, type: "LIKE" | "DISLIKE") => {
    if (!session) {
      toast({
        title: "Please sign in to like/dislike",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`/api/forum/comment/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) throw new Error("Failed to update like");

      fetchThread();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error updating like",
        status: "error",
        duration: 3000,
      });
    }
  };

  if (!thread) return null;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Thread Header */}
        <Card bg={bgColor} borderRadius="xl" shadow="sm">
          <CardBody>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={4}>
                <Heading size="lg">{thread.title}</Heading>
                <HStack spacing={4}>
                  <Badge
                    colorScheme="pink"
                    px={3}
                    py={1}
                    borderRadius="full"
                    textTransform="none"
                  >
                    {thread.category}
                  </Badge>
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      name={thread.author.name}
                      src={thread.author.image}
                    />
                    <Text fontSize="sm" color={textColor}>
                      {thread.author.name} • {thread.author.role}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
              {session?.user.role === "ADMIN" && (
                <IconButton
                  aria-label="Delete thread"
                  icon={<FaTrash />}
                  colorScheme="red"
                  variant="ghost"
                  onClick={onOpen}
                />
              )}
            </HStack>
            <Text mt={6} color={textColor}>
              {thread.content}
            </Text>
          </CardBody>
        </Card>

        <Divider />

        {/* Comments Section */}
        <VStack spacing={6} align="stretch">
          <Heading size="md">Komentar</Heading>

          {/* Comment Form */}
          <Card bg={bgColor} borderRadius="xl" shadow="sm">
            <CardBody>
              <form onSubmit={handleAddComment}>
                <VStack spacing={4}>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                      session
                        ? "Tulis komentar..."
                        : "Silakan masuk untuk menulis komentar"
                    }
                    disabled={!session}
                    size="md"
                    borderRadius="xl"
                    focusBorderColor="pink.500"
                    bg={cardBg}
                    _hover={{ borderColor: "pink.400" }}
                  />
                  <Button
                    type="submit"
                    colorScheme="pink"
                    isLoading={loading}
                    disabled={!session}
                    alignSelf="flex-end"
                    borderRadius="full"
                    px={6}
                  >
                    Kirim
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Comments List */}
          <VStack spacing={4}>
            {thread.comments.map((comment) => (
              <Card
                key={comment.id}
                w="full"
                bg={bgColor}
                borderRadius="xl"
                shadow="sm"
              >
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={comment.author.name}
                          src={comment.author.image}
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{comment.author.name}</Text>
                          <Text fontSize="sm" color="pink.500">
                            {comment.author.role === "EXPERT"
                              ? "Ahli " +
                                specialtyLabels[
                                  comment.author.specialty as ExpertSpecialty
                                ]
                              : comment.author.role}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Like"
                          icon={<FaThumbsUp />}
                          size="sm"
                          onClick={() => handleLike(comment.id, "LIKE")}
                          colorScheme={
                            comment.userLike?.type === "LIKE" ? "blue" : "gray"
                          }
                          variant="ghost"
                        />
                        <Text fontSize="sm" fontWeight="medium">
                          {comment._count.likes}
                        </Text>
                        <IconButton
                          aria-label="Dislike"
                          icon={<FaThumbsDown />}
                          size="sm"
                          onClick={() => handleLike(comment.id, "DISLIKE")}
                          colorScheme={
                            comment.userLike?.type === "DISLIKE"
                              ? "red"
                              : "gray"
                          }
                          variant="ghost"
                        />
                      </HStack>
                    </HStack>
                    <Text color={textColor}>{comment.content}</Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        </VStack>
      </VStack>

      {/* Delete Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>Delete Thread</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this thread? This action cannot be
            undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteThread}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
