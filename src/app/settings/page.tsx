"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Avatar,
  Text,
  Card,
  CardBody,
  Divider,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  AvatarBadge,
  Box,
  Center,
  useColorModeValue,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { createClient } from "@supabase/supabase-js";
import { useEffect } from "react";

const supabase = createClient(
  "https://ayvqagtjtkhriqwynupc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnFhZ3RqdGtocmlxd3ludXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMTk3NjUsImV4cCI6MjA0OTY5NTc2NX0.aDbCCeWvxbQtHxDv9FbZaj7pyQL0wZ017aoBKcRBYLc"
);

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran maksimal file adalah 5MB",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({
        title: "Format file tidak didukung",
        description: "Gunakan format JPG, PNG, atau WebP",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw new Error("Gagal mengunggah file");
      if (!data) throw new Error("Tidak ada data yang diterima dari server");

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(fileName);

      // Update user profile with new image URL
      await updateProfile({ image: publicUrl });

      // Update session with the new image URL
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          image: publicUrl,
        },
      });

      toast({
        title: "Foto profil berhasil diperbarui",
        status: "success",
        duration: 3000,
      });

      router.refresh();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Gagal mengunggah foto",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const updateProfile = async (data: {
    image?: string;
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      // Update session
      updateSession({
        user: {
          ...session?.user,
          name: result.user.name,
          image: result.user.image,
        },
      });

      console.log("Profile updated:", result);
      console.log("Session updated:", session);

      return result;
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const updateData: {
        name?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {};

      if (name !== session?.user?.name) updateData.name = name;
      if (currentPassword && newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "Tidak ada perubahan yang dilakukan",
          status: "info",
          duration: 3000,
        });
        return;
      }

      await updateProfile(updateData);

      toast({
        title: "Profil berhasil diperbarui",
        status: "success",
        duration: 3000,
      });

      setCurrentPassword("");
      setNewPassword("");
      await updateSession();
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ submit: (error as Error).message });
      toast({
        title: "Gagal memperbarui profil",
        description: (error as Error).message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    router.push("/signin");
    return null;
  }

  return (
    <Container maxW="container.md" py={8}>
      <Card
        bg={bgColor}
        borderRadius="xl"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <CardBody>
          <VStack spacing={8} align="stretch">
            <Heading size="lg">Pengaturan Akun</Heading>

            {/* Profile Image Section */}
            <Center>
              <Box position="relative">
                <Avatar
                  size="2xl"
                  src={session.user.image}
                  name={session.user.name}
                >
                  <AvatarBadge
                    as={IconButton}
                    size="sm"
                    rounded="full"
                    top="-12px"
                    colorScheme="pink"
                    aria-label="Edit Profile Picture"
                    icon={
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                    onClick={() => fileInputRef.current?.click()}
                  />
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Box>
            </Center>

            <Text fontSize="sm" color="gray.500" textAlign="center">
              Unggah foto profil baru
            </Text>

            <Divider />

            {/* Form Section */}
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                {/* Name Field */}
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Nama</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama baru"
                    size="lg"
                    borderRadius="xl"
                    focusBorderColor="pink.500"
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                {/* Current Password Field */}
                <FormControl isInvalid={!!errors.currentPassword}>
                  <FormLabel>Password Saat Ini</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                      borderRadius="xl"
                      focusBorderColor="pink.500"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        icon={
                          showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />
                        }
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
                </FormControl>

                {/* New Password Field */}
                <FormControl isInvalid={!!errors.newPassword}>
                  <FormLabel>Password Baru</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                      borderRadius="xl"
                      focusBorderColor="pink.500"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
                </FormControl>

                {errors.submit && (
                  <Text color="red.500" fontSize="sm">
                    {errors.submit}
                  </Text>
                )}

                <Button
                  type="submit"
                  colorScheme="pink"
                  size="lg"
                  isLoading={isLoading}
                  width="full"
                  borderRadius="full"
                  fontSize="md"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
