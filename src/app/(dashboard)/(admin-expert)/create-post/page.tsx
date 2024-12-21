"use client";

import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Textarea,
  useToast,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const postSchema = z.object({
  title: z.string().nonempty("Judul tidak boleh kosong"),
  content: z.string().nonempty("Konten tidak boleh kosong"),
  image: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export default function CreatePost() {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (
      session === null ||
      !["ADMIN", "EXPERT"].includes(session?.user?.role)
    ) {
      router.push("/signin");
    }
  }, [session, router]);

  // Show loading spinner while checking session
  if (session === undefined) {
    return (
      <Center minH="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Center>
    );
  }

  // If not authorized, don't render the form
  if (session === null || !["ADMIN", "EXPERT"].includes(session?.user?.role)) {
    return null;
  }

  const onSubmit = async (data: PostFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Berhasil membuat post",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/news");
      } else {
        throw new Error("Failed to create post");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: "Gagal membuat post",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Stack spacing={8}>
        <Heading>Buat Post Baru</Heading>

        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Judul</FormLabel>
              <Input {...register("title")} />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.image}>
              <FormLabel>URL Gambar (opsional)</FormLabel>
              <Input {...register("image")} />
              <FormErrorMessage>{errors.image?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.content}>
              <FormLabel>Konten</FormLabel>
              <Textarea
                {...register("content")}
                minHeight="400px"
                placeholder="Tulis konten post di sini..."
              />
              <FormErrorMessage>{errors.content?.message}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
              alignSelf="flex-end"
            >
              Publish Post
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
