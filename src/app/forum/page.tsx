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
  Box,
  Flex,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { subtitle } from "@/components/primitives";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { MessageCircle, User, Clock } from "lucide-react";

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
    category: "UMUM" as
      | "UMUM"
      | "TEKNOLOGI"
      | "KESEHATAN"
      | "EDUKASI"
      | "LAINNYA",
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
    <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
      <Stack spacing={8}>
        <Box textAlign="center" mb={8}>
          <Heading className="text-4xl md:text-5xl font-bold tracking-tight">
            Forum Diskusi
          </Heading>
          <Text
            className={subtitle({
              class: "mt-4 max-w-2xl mx-auto text-xl text-gray-600",
            })}
          >
            Berbagi Pengalaman dan Pengetahuan Sesama Orang Tua
          </Text>
        </Box>

        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxW={{ base: "full", md: "200px" }}
            bg="white"
            borderColor="gray.200"
            _hover={{ borderColor: "pink.200" }}
          >
            <option value="ALL">Semua Kategori</option>
            <option value="UMUM">Umum</option>
            <option value="TEKNOLOGI">Teknologi</option>
            <option value="KESEHATAN">Kesehatan</option>
            <option value="EDUKASI">Edukasi</option>
            <option value="LAINNYA">Lainnya</option>
          </Select>

          {session && (
            <Button
              onClick={onOpen}
              bgGradient="linear(to-r, pink.400, purple.500)"
              color="white"
              _hover={{
                bgGradient: "linear(to-r, pink.500, purple.600)",
                transform: "translateY(-2px)",
                shadow: "md",
              }}
              rounded="full"
              px={6}
              leftIcon={<MessageCircle size={18} />}
            >
              Buat Thread Baru
            </Button>
          )}
        </Flex>

        <Stack spacing={4}>
          {threads.map((thread) => (
            <Box
              key={thread.id}
              cursor="pointer"
              onClick={() => router.push(`/forum/${thread.id}`)}
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              rounded="xl"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "xl",
                borderColor: "pink.200",
              }}
            >
              <Box p={6}>
                <Stack spacing={4}>
                  <Heading
                    size="md"
                    bgGradient="linear(to-r, pink.500, purple.500)"
                    bgClip="text"
                  >
                    {thread.title}
                  </Heading>

                  <Stack
                    direction={{ base: "column", sm: "row" }}
                    spacing={4}
                    align={{ base: "flex-start", sm: "center" }}
                  >
                    <Badge
                      px={3}
                      py={1}
                      colorScheme="pink"
                      rounded="full"
                      textTransform="capitalize"
                    >
                      {thread.category.toLowerCase()}
                    </Badge>

                    <HStack spacing={4} color="gray.500" fontSize="sm">
                      <HStack>
                        <User size={14} />
                        <Text>{thread.author.name}</Text>
                      </HStack>

                      <HStack>
                        <Clock size={14} />
                        <Text>
                          {formatDistanceToNow(new Date(thread.createdAt), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </Text>
                      </HStack>

                      <HStack>
                        <MessageCircle size={14} />
                        <Text>{thread._count.comments} komentar</Text>
                      </HStack>
                    </HStack>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent rounded="xl">
          <ModalHeader
            bgGradient="linear(to-r, pink.400, purple.500)"
            color="white"
            roundedTop="xl"
          >
            Buat Thread Baru
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody py={6}>
            <form onSubmit={handleCreateThread}>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Judul</FormLabel>
                  <Input
                    value={newThread.title}
                    onChange={(e) =>
                      setNewThread({ ...newThread, title: e.target.value })
                    }
                    borderColor="gray.200"
                    _hover={{ borderColor: "pink.200" }}
                    _focus={{ borderColor: "pink.400", boxShadow: "none" }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Konten</FormLabel>
                  <Textarea
                    value={newThread.content}
                    onChange={(e) =>
                      setNewThread({ ...newThread, content: e.target.value })
                    }
                    minH="200px"
                    borderColor="gray.200"
                    _hover={{ borderColor: "pink.200" }}
                    _focus={{ borderColor: "pink.400", boxShadow: "none" }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    value={newThread.category}
                    onChange={(e) =>
                      setNewThread({
                        ...newThread,
                        category: e.target.value as
                          | "UMUM"
                          | "TEKNOLOGI"
                          | "KESEHATAN"
                          | "EDUKASI"
                          | "LAINNYA",
                      })
                    }
                    borderColor="gray.200"
                    _hover={{ borderColor: "pink.200" }}
                    _focus={{ borderColor: "pink.400", boxShadow: "none" }}
                  >
                    <option value="UMUM">Umum</option>
                    <option value="TEKNOLOGI">Teknologi</option>
                    <option value="KESEHATAN">Kesehatan</option>
                    <option value="EDUKASI">Edukasi</option>
                    <option value="LAINNYA">Lainnya</option>
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  bgGradient="linear(to-r, pink.400, purple.500)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, pink.500, purple.600)",
                  }}
                  isLoading={loading}
                  loadingText="Membuat Thread..."
                >
                  Buat Thread
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
