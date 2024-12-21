"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Avatar,
  Image,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Author {
  name: string;
  role: string;
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
      const response = await fetch("/api/posts");
      const data = await response.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <Container maxW="container.lg" py={8}>
      <Stack spacing={8}>
        {posts.map((post) => (
          <Link key={post.id} href={`/news/${post.id}`}>
            <Box
              p={5}
              cursor="pointer"
              _hover={{ shadow: "md" }}
              borderRadius="lg"
            >
              <Stack direction="row" spacing={4} height="200px">
                <Stack flex={1} spacing={2}>
                  <Heading fontSize="xl">{post.title}</Heading>
                  <Text noOfLines={3} color="gray.500">
                    {post.content}
                  </Text>
                  <Stack direction="row" spacing={4} align="center" mt="auto">
                    <Avatar size="sm" />
                    <Stack direction="column" spacing={0} fontSize="sm">
                      <Text fontWeight={600}>{post.author.name}</Text>
                      <Text color="gray.500">
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
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    width="200px"
                    height="200px"
                    objectFit="cover"
                    borderRadius="lg"
                  />
                )}
              </Stack>
            </Box>
          </Link>
        ))}
      </Stack>
    </Container>
  );
}
