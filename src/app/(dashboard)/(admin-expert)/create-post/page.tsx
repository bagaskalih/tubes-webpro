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
          title: "Berhasil membuat Artikel",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/artikel");
      } else {
        throw new Error("Failed to create Artkiasdasd");
      }
    } catch (error) {
      console.error("Failed to create Artikel:", error);
      toast({
        title: "Gagal membuat Artikel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="7xl" py={8}>
      <Stack spacing={8}>
        <Heading
          size="lg"
          bgGradient="linear(to-r, pink.500, purple.500)"
          bgClip="text"
        >
          Buat Artikel Baru
        </Heading>

        <Box
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          bg="white"
          shadow="sm"
          rounded="xl"
          borderWidth="1px"
          borderColor="gray.200"
          p={6}
        >
          <Stack spacing={6}>
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Judul</FormLabel>
              <Input
                {...register("title")}
                focusBorderColor="pink.500"
                _hover={{ borderColor: "gray.300" }}
              />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.image}>
              <FormLabel>URL Gambar (opsional)</FormLabel>
              <Input
                {...register("image")}
                focusBorderColor="pink.500"
                _hover={{ borderColor: "gray.300" }}
              />
              <FormErrorMessage>{errors.image?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.content}>
              <FormLabel>Konten</FormLabel>
              <Textarea
                {...register("content")}
                minH="400px"
                focusBorderColor="pink.500"
                _hover={{ borderColor: "gray.300" }}
                placeholder="Tulis konten artikel di sini..."
              />
              <FormErrorMessage>{errors.content?.message}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="pink"
              isLoading={isSubmitting}
              alignSelf="flex-end"
              rounded="full"
              size="lg"
            >
              Publish Artikel
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
