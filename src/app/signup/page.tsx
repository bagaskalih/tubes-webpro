"use client";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  FormErrorMessage,
  useToast,
  Divider,
  Center,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

// Define the schema for validation using zod
const FormSchema = z.object({
  name: z.string().nonempty("Nama tidak boleh kosong"),
  email: z
    .string()
    .email("Email tidak valid")
    .nonempty("Email tidak boleh kosong"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export default function SignUpForm() {
  const router = useRouter();
  const session = useSession();
  if (session.data) {
    router.push("/");
  }

  const [isLoading, setIsLoading] = useState(false); // Loading state for the form submission
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Gagal masuk",
          description: "Gagal masuk menggunakan Google",
          status: "error",
          isClosable: true,
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat masuk dengan Google",
        status: "error",
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    if (response.ok) {
      toast({
        title: "Akun berhasil dibuat",
        description: "Silakan masuk untuk melanjutkan",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push("/signin");
    } else {
      setIsLoading(false); // Stop loading spinner on error
      toast({
        title: "Gagal membuat akun",
        description: "Silakan coba lagi",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Failed to sign up");
    }
  };

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"md"} w="full" py={12} px={6}>
        <Stack align={"center"} spacing={6}>
          <Heading
            fontSize={"4xl"}
            bgGradient="linear(to-r, pink.400, purple.400)"
            bgClip="text"
          >
            Buat Akun Baru
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            Mari bergabung bersama komunitas kami 🚀
          </Text>
        </Stack>

        <Box
          rounded={"xl"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"xl"}
          p={8}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={5}>
              <FormControl id="name" isInvalid={!!errors.name}>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Nama Lengkap
                </FormLabel>
                <Input
                  type="text"
                  {...register("name")}
                  size="lg"
                  borderRadius="lg"
                  focusBorderColor="pink.400"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Alamat Email
                </FormLabel>
                <Input
                  type="email"
                  {...register("email")}
                  size="lg"
                  borderRadius="lg"
                  focusBorderColor="pink.400"
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Password
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    borderRadius="lg"
                    focusBorderColor="pink.400"
                  />
                  <InputRightElement width="3rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <Stack spacing={6} pt={4}>
                <Button
                  type="submit"
                  bg="pink.400"
                  color="white"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  borderRadius="lg"
                  _hover={{
                    bg: "pink.500",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s",
                  }}
                >
                  Daftar Sekarang
                </Button>

                <Text align={"center"} fontSize="sm">
                  Sudah punya akun?{" "}
                  <Link
                    href="/signin"
                    color="pink.500"
                    _hover={{ color: "pink.600" }}
                    fontWeight="medium"
                  >
                    Masuk
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>

          <Flex align="center" my={6}>
            <Divider flex={1} />
            <Text px={4} color="gray.500">
              atau
            </Text>
            <Divider flex={1} />
          </Flex>

          <Button
            w={"full"}
            maxW={"md"}
            variant={"outline"}
            leftIcon={<FcGoogle />}
            onClick={handleGoogleSignIn}
            isLoading={isLoading}
            mb={6}
            height="12"
            fontSize="md"
            borderRadius="lg"
            borderWidth={2}
            _hover={{
              bg: "gray.50",
              transform: "translateY(-2px)",
              transition: "all 0.2s",
            }}
          >
            <Center>
              <Text>Lanjutkan dengan Google</Text>
            </Center>
          </Button>
        </Box>
      </Stack>
    </Flex>
  );
}
