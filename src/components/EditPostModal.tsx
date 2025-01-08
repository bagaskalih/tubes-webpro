import { useState, useRef, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Stack,
  VStack,
  Box,
  Image,
  Icon,
  Text,
  useToast,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayvqagtjtkhriqwynupc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnFhZ3RqdGtocmlxd3ludXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMTk3NjUsImV4cCI6MjA0OTY5NTc2NX0.aDbCCeWvxbQtHxDv9FbZaj7pyQL0wZ017aoBKcRBYLc"
);

const editPostSchema = z.object({
  title: z.string().nonempty("Judul tidak boleh kosong"),
  content: z.string().nonempty("Konten tidak boleh kosong"),
  image: z.any().optional(),
});

type EditPostFormData = z.infer<typeof editPostSchema>;

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    title: string;
    content: string;
    image?: string;
  } | null;
  onPostUpdate: (updatedPost: any) => void;
}

export function EditPostModal({
  isOpen,
  onClose,
  post,
  onPostUpdate,
}: EditPostModalProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditPostFormData>({
    resolver: zodResolver(editPostSchema),
  });

  // Update form values when post changes or modal opens
  useEffect(() => {
    if (post && isOpen) {
      reset({
        title: post.title,
        content: post.content,
      });
      setImagePreview(post.image || null);
    }
  }, [post, isOpen, reset]);

  const handleImageUpload = async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Ukuran file maksimal 5MB");
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Format file harus JPG, PNG, atau WebP");
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

    if (uploadError) throw new Error("Gagal mengunggah gambar");
    if (!data) throw new Error("Tidak ada data yang diterima dari server");

    const {
      data: { publicUrl },
    } = supabase.storage.from("artikel-images").getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (data: EditPostFormData) => {
    if (!post?.id) return;

    try {
      setIsSubmitting(true);

      let imageUrl = post.image; // Keep existing image by default

      if (data.image instanceof File) {
        try {
          imageUrl = await handleImageUpload(data.image);
        } catch (error) {
          toast({
            title: "Gagal mengunggah gambar",
            description:
              error instanceof Error ? error.message : "Terjadi kesalahan",
            status: "error",
            duration: 3000,
          });
          return;
        }
      }

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui artikel");
      }

      const updatedPost = await response.json();
      onPostUpdate(updatedPost);

      toast({
        title: "Artikel berhasil diperbarui",
        status: "success",
        duration: 3000,
      });

      handleCloseModal();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Gagal memperbarui artikel",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    reset();
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Artikel</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel>Judul</FormLabel>
                <Input
                  {...register("title")}
                  placeholder="Masukkan judul artikel"
                  focusBorderColor="pink.500"
                />
                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Gambar Artikel</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue("image", file);
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
              </FormControl>

              <FormControl isInvalid={!!errors.content}>
                <FormLabel>Konten</FormLabel>
                <Textarea
                  {...register("content")}
                  placeholder="Tulis konten artikel di sini..."
                  minH="300px"
                  focusBorderColor="pink.500"
                />
                <FormErrorMessage>{errors.content?.message}</FormErrorMessage>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
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
}
