"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Avatar,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { subtitle } from "@/components/primitives";

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

interface Author {
  name: string;
  role: string;
  specialty?: ExpertSpecialty;
  image: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  image?: string;
  author: Author;
  createdAt: string;
  _count: {
    comments: number;
  };
}
export default function NewsList() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
      <Stack spacing={8} mb={12}>
        <Box textAlign="center">
          <Heading className="text-4xl md:text-5xl font-bold tracking-tight">
            Artikel Terbaru
          </Heading>
          <Text
            className={subtitle({
              class: "mt-4 max-w-2xl mx-auto text-xl text-gray-600",
            })}
          >
            Wawasan dan Tips dari Para Ahli untuk Orang Tua Modern
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {posts.map((post) => (
            <Link key={post.id} href={`/artikel/${post.id}`}>
              <Box
                p={6}
                height="full"
                transition="all 0.3s"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                bg="white"
                _hover={{
                  transform: "translateY(-4px)",
                  shadow: "xl",
                  borderColor: "pink.200",
                }}
              >
                <Stack spacing={4}>
                  {post.image && (
                    <Box
                      borderRadius="lg"
                      overflow="hidden"
                      position="relative"
                      height="200px"
                    >
                      <Image
                        src={post.image}
                        alt={post.title}
                        objectFit="cover"
                        width="100%"
                        height="100%"
                      />
                    </Box>
                  )}

                  <Stack spacing={3}>
                    <Heading
                      fontSize="xl"
                      bgGradient="linear(to-r, pink.500, purple.500)"
                      bgClip="text"
                    >
                      {post.title}
                    </Heading>
                    <Text noOfLines={3} color="gray.600">
                      {post.content}
                    </Text>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={4}
                    align="center"
                    mt="auto"
                    pt={4}
                    borderTop="1px"
                    borderColor="gray.100"
                  >
                    <Avatar
                      size="md"
                      src={post.author.image}
                      ring={2}
                      ringColor="pink.400"
                    />
                    <Stack spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">
                        {post.author.name}
                        <Text as="span" color="pink.500">
                          {" · "}
                          {expertSpecialtyLabel[
                            post.author
                              .specialty as unknown as ExpertSpecialtyType
                          ] || post.author.role}
                        </Text>
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                        {" · "}
                        {post._count.comments} komentar
                      </Text>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
