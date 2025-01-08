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
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Flex,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Icon,
  VStack,
  Text,
  Image,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";
import { EditPostModal } from "@/components/EditPostModal";

const supabase = createClient(
  "https://ayvqagtjtkhriqwynupc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnFhZ3RqdGtocmlxd3ludXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMTk3NjUsImV4cCI6MjA0OTY5NTc2NX0.aDbCCeWvxbQtHxDv9FbZaj7pyQL0wZ017aoBKcRBYLc"
);

const postSchema = z.object({
  title: z.string().nonempty("Judul tidak boleh kosong"),
  content: z.string().nonempty("Konten tidak boleh kosong"),
  image: z.any().optional(), // Changed to accept File object
});

type PostFormData = z.infer<typeof postSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
interface Post {
  id: string;
  title: string;
  content: string;
  image: string;
  author: User;
  authorId: number;
  comments: any[];
  createdAt: string;
  updatedAt: string;
}

export default function CreatePost() {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const cancelRef = useRef<HTMLButtonElement>(null!);

  const handleImageUpload = async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Ukuran maksimal file adalah 5MB");
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Gunakan format JPG, PNG, atau WebP");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("artikel-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw new Error("Gagal mengunggah file");
    if (!data) throw new Error("Tidak ada data yang diterima dari server");

    const {
      data: { publicUrl },
    } = supabase.storage.from("artikel-images").getPublicUrl(fileName);

    return publicUrl;
  };

  const { setValue } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    onEditOpen();
  };

  const handlePostUpdate = () => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        // sort posts by id in ascending order
        data.sort((a: Post, b: Post) => parseInt(a.id) - parseInt(b.id));
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    onDeleteOpen();
  };

  const onConfirmDelete = async () => {
    if (!selectedPost) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Artikel berhasil dihapus",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Remove deleted post from the list
        const updatedPosts = posts.filter(
          (post) => post.id !== selectedPost.id
        );
        setPosts(updatedPosts);
        onDeleteClose();
      } else {
        throw new Error("Failed to delete artikel");
      }
    } catch (error) {
      console.error("Failed to delete Artikel:", error);
      toast({
        title: "Gagal menghapus Artikel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        // sort posts by id in ascending order
        data.sort((a: Post, b: Post) => parseInt(a.id) - parseInt(b.id));
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

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

      let imageUrl = "";
      if (data.image instanceof File) {
        imageUrl = await handleImageUpload(data.image);
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image: imageUrl,
        }),
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
        throw new Error("Failed to create artikel");
      }
    } catch (error) {
      console.error("Failed to create Artikel:", error);
      toast({
        title: "Gagal membuat Artikel",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ImageUploadControl = () => (
    <FormControl isInvalid={!!errors.image}>
      <FormLabel>Gambar Artikel</FormLabel>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setValue("image", file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
          }
        }}
        hidden
        ref={fileInputRef}
      />
      <Box
        border="2px dashed"
        borderColor="gray.200"
        borderRadius="xl"
        p={4}
        textAlign="center"
        cursor="pointer"
        onClick={() => fileInputRef.current?.click()}
        _hover={{ borderColor: "pink.500" }}
      >
        {imagePreview ? (
          <VStack spacing={4}>
            <Image
              src={imagePreview}
              alt="Preview"
              maxH="200px"
              objectFit="contain"
            />
            <Button
              size="sm"
              colorScheme="pink"
              onClick={(e) => {
                e.stopPropagation();
                setValue("image", undefined);
                setImagePreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Hapus Gambar
            </Button>
          </VStack>
        ) : (
          <VStack spacing={2}>
            <Icon as={FiUpload} w={8} h={8} color="gray.400" />
            <Text>Klik untuk mengunggah gambar</Text>
            <Text fontSize="sm" color="gray.500">
              Format: JPG, PNG, atau WebP (Max 5MB)
            </Text>
          </VStack>
        )}
      </Box>
      <FormErrorMessage>{errors.image?.message?.toString()}</FormErrorMessage>
    </FormControl>
  );

  const DeleteAlert = () => (
    <AlertDialog
      isOpen={isDeleteOpen}
      leastDestructiveRef={cancelRef}
      onClose={onDeleteClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Hapus Artikel
          </AlertDialogHeader>

          <AlertDialogBody>
            Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onDeleteClose}>
              Batal
            </Button>
            <Button
              colorScheme="red"
              onClick={onConfirmDelete}
              ml={3}
              isLoading={isSubmitting}
            >
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );

  // Update the action buttons in the table
  const ActionButtons = ({ post }: { post: Post }) => (
    <Flex gap={3} justifyContent="flex-start">
      <Button colorScheme="pink" size="sm" onClick={() => handleEdit(post)}>
        Edit
      </Button>
      <Button colorScheme="red" size="sm" onClick={() => handleDelete(post)}>
        Delete
      </Button>
    </Flex>
  );

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

            <ImageUploadControl />

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
        <Box
          bg="white"
          shadow="sm"
          rounded="xl"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <Box px={6} py={5} borderBottomWidth="1px">
            <Heading
              size="lg"
              bgGradient="linear(to-r, pink.500, purple.500)"
              bgClip="text"
            >
              Daftar Artikel
            </Heading>
          </Box>

          <Box px={6} py={6} overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Title</Th>
                  <Th>Author</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {posts.map((post) => (
                  <Tr key={post.id}>
                    <Td>{post.id}</Td>
                    <Td>{post.title}</Td>
                    <Td>{post.author.name}</Td>
                    <Td>
                      <ActionButtons post={post} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Stack>
      <EditPostModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        post={selectedPost}
        onPostUpdate={handlePostUpdate}
      />
      <DeleteAlert />
    </Container>
  );
}
