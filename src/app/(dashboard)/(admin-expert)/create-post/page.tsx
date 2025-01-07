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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const postSchema = z.object({
  title: z.string().nonempty("Judul tidak boleh kosong"),
  content: z.string().nonempty("Konten tidak boleh kosong"),
  image: z.string().optional(),
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
  author: User;
  content: string;
  image: string;
}

export default function CreatePost() {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null!);

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    formState: { errors: editErrors },
    reset: resetEditForm,
    setValue,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setValue("title", post.title);
    setValue("content", post.content);
    setValue("image", post.image);
    onEditOpen();
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    onDeleteOpen();
  };

  const onEditSubmit = async (data: PostFormData) => {
    if (!selectedPost) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Artikel berhasil diperbarui",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Refresh posts list
        const updatedPosts = posts.map((post) =>
          post.id === selectedPost.id ? { ...post, ...data } : post
        );
        setPosts(updatedPosts);
        onEditClose();
        resetEditForm();
      } else {
        throw new Error("Failed to update artikel");
      }
    } catch (error) {
      console.error("Failed to update Artikel:", error);
      toast({
        title: "Gagal memperbarui Artikel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
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
        throw new Error("Failed to create artikel");
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

  const EditModal = () => (
    <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Artikel</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleEditSubmit(onEditSubmit)}>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={!!editErrors.title}>
                <FormLabel>Judul</FormLabel>
                <Input
                  {...editRegister("title")}
                  focusBorderColor="pink.500"
                  _hover={{ borderColor: "gray.300" }}
                />
                <FormErrorMessage>{editErrors.title?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!editErrors.image}>
                <FormLabel>URL Gambar (opsional)</FormLabel>
                <Input
                  {...editRegister("image")}
                  focusBorderColor="pink.500"
                  _hover={{ borderColor: "gray.300" }}
                />
                <FormErrorMessage>{editErrors.image?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!editErrors.content}>
                <FormLabel>Konten</FormLabel>
                <Textarea
                  {...editRegister("content")}
                  minH="300px"
                  focusBorderColor="pink.500"
                  _hover={{ borderColor: "gray.300" }}
                />
                <FormErrorMessage>
                  {editErrors.content?.message}
                </FormErrorMessage>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Batal
            </Button>
            <Button type="submit" colorScheme="pink" isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
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
      <EditModal />
      <DeleteAlert />
    </Container>
  );
}
