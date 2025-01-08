"use client";
import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Avatar,
  Divider,
  useColorModeValue,
  Badge,
  Textarea,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

interface Author {
  name: string;
  role: string;
  specialty?: ExpertSpecialty;
  image: string;
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

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.100");

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
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Hero Image */}
        {post.image && (
          <Box
            position="relative"
            height="400px"
            width="100%"
            overflow="hidden"
            borderRadius="xl"
          >
            <Box
              as="img"
              src={post.image}
              alt={post.title}
              objectFit="cover"
              width="100%"
              height="100%"
            />
          </Box>
        )}

        {/* Article Header */}
        <VStack spacing={6} align="stretch">
          <Text
            as="h1"
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="bold"
            lineHeight="tight"
          >
            {post.title}
          </Text>

          <HStack spacing={4}>
            <Avatar size="md" src={post.author.image} name={post.author.name} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold">{post.author.name}</Text>
              <Text fontSize="sm" color="gray.500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </Text>
            </VStack>
          </HStack>
        </VStack>

        <Box
          className="article-content"
          sx={{
            "& p, & li, & blockquote": {
              textAlign: "justify !important",
              textJustify: "inter-word !important",
            },
            "& .markdown-content": {
              "h1, h2, h3, h4, h5, h6": {
                fontWeight: "bold",
                lineHeight: "tight",
                mt: 6,
                mb: 4,
              },
              h1: { fontSize: "4xl" },
              h2: { fontSize: "3xl" },
              h3: { fontSize: "2xl" },
              h4: { fontSize: "xl" },
              p: {
                mb: 4,
                lineHeight: "tall",
                fontSize: "lg",
              },
              "ul, ol": {
                pl: 6,
                mb: 4,
              },
              li: {
                mb: 2,
              },
              blockquote: {
                borderLeftWidth: "4px",
                borderLeftColor: "pink.500",
                pl: 4,
                py: 2,
                my: 4,
                fontStyle: "italic",
              },
              a: {
                color: "pink.500",
                textDecoration: "underline",
                _hover: {
                  color: "pink.600",
                },
              },
              img: {
                maxW: "100%",
                h: "auto",
                borderRadius: "lg",
                my: 4,
              },
            },
          }}
        >
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <Text
                    mb={4}
                    lineHeight="tall"
                    fontSize="lg"
                    textAlign="justify"
                    sx={{
                      textAlign: "justify",
                    }}
                  >
                    {children}
                  </Text>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </Box>

        <Divider my={8} />

        {/* Comments Section */}
        <VStack spacing={6} align="stretch">
          {session ? (
            <Box>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis komentar..."
                size="lg"
                borderRadius="xl"
                focusBorderColor="pink.500"
                mb={4}
              />
              <Button
                colorScheme="pink"
                borderRadius="full"
                px={8}
                float="right"
                onClick={handleCommentSubmit}
              >
                Kirim Komentar
              </Button>
            </Box>
          ) : (
            <Box bg="gray.50" p={6} borderRadius="xl" textAlign="center">
              <Text color="gray.600">
                Silakan masuk terlebih dahulu untuk menambahkan komentar.
              </Text>
            </Box>
          )}

          <Text fontSize="2xl" fontWeight="bold" mt={8}>
            Komentar ({post.comments.length})
          </Text>

          <VStack spacing={4} align="stretch">
            {post.comments.map((comment) => (
              <Box
                key={comment.id}
                p={6}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
              >
                <HStack spacing={4} mb={4}>
                  <Avatar
                    size="sm"
                    src={comment.author.image}
                    name={comment.author.name}
                  />
                  <VStack align="start" spacing={0}>
                    <HStack>
                      <Text fontWeight="semibold">{comment.author.name}</Text>
                      <Badge colorScheme="pink">
                        {comment.author.specialty
                          ? "Ahli " +
                            expertSpecialtyLabel[
                              comment.author
                                .specialty as unknown as ExpertSpecialtyType
                            ]
                          : "Pengguna"}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </Text>
                  </VStack>
                </HStack>
                <Text color={textColor}>{comment.content}</Text>
              </Box>
            ))}
          </VStack>
        </VStack>
      </VStack>
    </Container>
  );
}
