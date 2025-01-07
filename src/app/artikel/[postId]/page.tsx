"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Avatar,
  useColorModeValue,
  Image,
  Divider,
  Button,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Author {
  name: string;
  role: string;
  specialty?: ExpertSpecialty;
}

enum ExpertSpecialty {
  NUTRISI_ANAK,
  PSIKOLOGI_ANAK,
  PARENTING,
  PERTUMBUHAN_ANAK,
  EDUKASI_ANAK,
}

enum ExpertSpecialtyType {
  NUTRISI_ANAK = "NUTRISI_ANAK",
  PSIKOLOGI_ANAK = "PSIKOLOGI_ANAK",
  PARENTING = "PARENTING",
  PERTUMBUHAN_ANAK = "PERTUMBUHAN_ANAK",
  EDUKASI_ANAK = "EDUKASI_ANAK",
}

const expertSpecialtyLabel: Record<ExpertSpecialtyType, string> = {
  NUTRISI_ANAK: "Nutrisi Anak",
  PSIKOLOGI_ANAK: "Psikologi Anak",
  PARENTING: "Parenting",
  PERTUMBUHAN_ANAK: "Pertumbuhan Anak",
  EDUKASI_ANAK: "Pendidikan Anak",
};

interface Comment {
  id: number;
  content: string;
  author: Author;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  image?: string;
  author: Author;
  createdAt: string;
  comments: Comment[];
}

interface PageParams {
  params: Promise<{ postId: string }>;
}

export default function NewsDetailWrapper({ params }: PageParams) {
  const resolvedParams = use(params);
  return <NewsDetailContent postId={resolvedParams.postId} />;
}

function NewsDetailContent({ postId }: { postId: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const { data: session } = useSession();
  const toast = useToast();
  const commentBgColor = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      const response = await fetch(`/api/posts/${postId}`);
      const data = await response.json();
      setPost(data);
    };
    fetchPost();
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (!session) {
      toast({
        title: "Silakan masuk terlebih dahulu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setPost((prev) =>
          prev ? { ...prev, comments: [newComment, ...prev.comments] } : null
        );
        setComment("");
        toast({
          title: "Komentar berhasil ditambahkan",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Gagal menambahkan komentar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!post) return null;

  return (
    <Container maxW="container.md" py={8}>
      <Stack spacing={8}>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width="100%"
            height="400px"
            objectFit="cover"
            borderRadius="lg"
          />
        )}

        <Stack spacing={4}>
          <Heading size="2xl">{post.title}</Heading>

          <Stack direction="row" spacing={4} align="center">
            <Avatar size="md" />
            <Stack direction="column" spacing={0}>
              <Text fontWeight={600}>{post.author.name}</Text>
              <Text color="gray.500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </Text>
            </Stack>
          </Stack>
        </Stack>

        <Text fontSize="lg" whiteSpace="pre-wrap" textAlign="justify">
          {post.content}
        </Text>

        <Divider my={8} />

        {/* comment form if logged in */}
        {session && (
          <Stack spacing={4}>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis komentar..."
              size="sm"
            />
            <Button
              colorScheme="blue"
              onClick={handleCommentSubmit}
              alignSelf="flex-end"
            >
              Kirim Komentar
            </Button>
          </Stack>
        )}

        {!session && (
          <Box p={4} borderRadius="md" bg={commentBgColor}>
            <Text>
              Silakan masuk terlebih dahulu untuk menambahkan komentar.
            </Text>
          </Box>
        )}

        <Stack spacing={8}>
          <Heading size="md">Komentar ({post.comments.length})</Heading>
          {post.comments.map((comment) => (
            <Box key={comment.id} p={4} borderRadius="md" bg={commentBgColor}>
              <Stack direction="row" spacing={4}>
                <Avatar size="sm" />
                <Stack flex={1} spacing={2}>
                  <Stack direction="row" align="center" spacing={2}>
                    <Text fontWeight={600}>{comment.author.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {comment.author.specialty
                        ? "Ahli " +
                          expertSpecialtyLabel[
                            post.author
                              .specialty as unknown as ExpertSpecialtyType
                          ]
                        : "Pengguna"}
                    </Text>
                  </Stack>
                  <Text>{comment.content}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
