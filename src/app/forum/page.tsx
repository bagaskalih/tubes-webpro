// src/app/forum/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Thread } from "@/types/forum";
import {
  Container,
  Heading,
  Select,
  Button,
  Stack,
  Card,
  CardBody,
  Text,
  Badge,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ForumPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [category, setCategory] = useState("ALL");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [newThread, setNewThread] = useState({
    title: "",
    content: "",
    category: "GENERAL" as
      | "GENERAL"
      | "TECHNOLOGY"
      | "HEALTH"
      | "EDUCATION"
      | "OTHER",
  });

  const fetchThreads = async () => {
    try {
      const url =
        category === "ALL"
          ? "/api/forum/thread"
          : `/api/forum/thread?category=${category}`;

      const response = await fetch(url);
      const data = await response.json();
      setThreads(data.threads);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching threads",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [category]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/forum/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThread),
      });

      if (!response.ok) throw new Error("Failed to create thread");

      toast({
        title: "Thread created successfully",
        status: "success",
        duration: 3000,
      });
      onClose();
      fetchThreads();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error creating thread",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={6}>
        <HStack justify="space-between">
          <Heading size="lg">Forum Discussions</Heading>
          {session && (
            <Button colorScheme="blue" onClick={onOpen}>
              Create New Thread
            </Button>
          )}
        </HStack>

        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          maxW="200px"
        >
          <option value="ALL">All Categories</option>
          <option value="GENERAL">General</option>
          <option value="TECHNOLOGY">Technology</option>
          <option value="HEALTH">Health</option>
          <option value="EDUCATION">Education</option>
          <option value="OTHER">Other</option>
        </Select>

        <Stack spacing={4}>
          {threads.map((thread) => (
            <Card
              key={thread.id}
              cursor="pointer"
              onClick={() => router.push(`/forum/${thread.id}`)}
              _hover={{ shadow: "md" }}
            >
              <CardBody>
                <Stack spacing={2}>
                  <Heading size="md">{thread.title}</Heading>
                  <HStack>
                    <Badge colorScheme="blue">{thread.category}</Badge>
                    <Text fontSize="sm">
                      by {thread.author.name} ({thread.author.role})
                    </Text>
                    <Text fontSize="sm">{thread._count.comments} comments</Text>
                  </HStack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Stack>
      </Stack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Thread</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleCreateThread}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={newThread.title}
                    onChange={(e) =>
                      setNewThread({ ...newThread, title: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Content</FormLabel>
                  <Textarea
                    value={newThread.content}
                    onChange={(e) =>
                      setNewThread({ ...newThread, content: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={newThread.category}
                    onChange={(e) =>
                      setNewThread({
                        ...newThread,
                        category: e.target.value as
                          | "GENERAL"
                          | "TECHNOLOGY"
                          | "HEALTH"
                          | "EDUCATION"
                          | "OTHER",
                      })
                    }
                  >
                    <option value="GENERAL">General</option>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="HEALTH">Health</option>
                    <option value="EDUCATION">Education</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  mb={4}
                >
                  Create Thread
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ForumPage;
