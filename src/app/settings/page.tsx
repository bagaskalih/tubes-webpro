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

  // Keep name in sync with session
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
      const result = await updateProfile({ image: publicUrl });

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

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({
        submit: (error as Error).message,
      });
      toast({
        title: "Gagal memperbarui profil",
        description: (error as Error).message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }

    // Force a session refresh after successful update
    await updateSession();
    router.refresh();
  };

  if (!session) {
    router.push("/signin");
    return null;
  }

  return (
    <Container maxW="container.md" py={8}>
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Heading size="lg">Pengaturan Akun</Heading>

            <VStack textAlign="center">
              <Avatar
                size="2xl"
                src={session.user.image}
                name={session.user.name}
                mb={4}
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isLoading}
              >
                Ganti Foto Profil
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </VStack>

            <Divider />

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Nama</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama baru"
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.currentPassword}>
                  <FormLabel>Password Saat Ini</FormLabel>
                  <InputGroup>
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                    />
                    <InputRightElement>
                      <IconButton
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
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.newPassword}>
                  <FormLabel>Password Baru</FormLabel>
                  <InputGroup>
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        variant="ghost"
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
                  colorScheme="blue"
                  isLoading={isLoading}
                  w="full"
                >
                  Simpan Perubahan
                </Button>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
