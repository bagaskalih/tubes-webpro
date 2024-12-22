"use client";

import { useEffect, useState, use } from "react";
import { Thread } from "@/types/forum";
import {
  Box,
  Container,
  Heading,
  Stack,
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
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaThumbsUp, FaThumbsDown, FaTrash } from "react-icons/fa";

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
  const [thread, setThread] = useState<Thread | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!threadId) return;
    fetchThread();
  }, []);

  const fetchThread = async () => {
    try {
      const response = await fetch(`/api/forum/thread/${threadId}`);
      if (!response.ok) throw new Error("Thread not found");
      const data = await response.json();
      setThread(data.thread);
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
      <Stack spacing={6}>
        <Box>
          <HStack justify="space-between" align="start">
            <Stack>
              <Heading size="lg">{thread.title}</Heading>
              <HStack>
                <Badge colorScheme="blue">{thread.category}</Badge>
                <Text fontSize="sm">
                  by {thread.author.name} ({thread.author.role})
                </Text>
              </HStack>
            </Stack>
            {session?.user.role === "ADMIN" && (
              <IconButton
                aria-label="Delete thread"
                icon={<FaTrash />}
                colorScheme="red"
                onClick={onOpen}
              />
            )}
          </HStack>
          <Text mt={4}>{thread.content}</Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={4}>
            Comments
          </Heading>

          <form onSubmit={handleAddComment}>
            <Stack spacing={4}>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  session
                    ? "Add a comment..."
                    : "Please sign in to add a comment"
                }
                disabled={!session}
              />
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                disabled={!session}
                alignSelf="flex-end"
              >
                Add Comment
              </Button>
            </Stack>
          </form>

          <Stack spacing={4} mt={6}>
            {thread.comments.map((comment) => (
              <Card key={comment.id}>
                <CardBody>
                  <Stack spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm">
                        {comment.author.name} ({comment.author.role})
                      </Text>
                      <HStack>
                        <IconButton
                          aria-label="Like"
                          icon={<FaThumbsUp />}
                          size="sm"
                          onClick={() => handleLike(comment.id, "LIKE")}
                          colorScheme={
                            comment.userLike?.type === "LIKE" ? "blue" : "gray"
                          }
                        />
                        <Text>{comment._count.likes}</Text>
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
                        />
                      </HStack>
                    </HStack>
                    <Text>{comment.content}</Text>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </Stack>
        </Box>
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Thread</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this thread? This action cannot be
            undone.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
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
