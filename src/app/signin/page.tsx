"use client";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Center,
  Link,
  FormErrorMessage,
  useToast,
  Divider,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

// Define the schema for validation using zod
const FormSchema = z.object({
  email: z
    .string()
    .email("Email tidak valid")
    .nonempty("Email tidak boleh kosong"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export default function SignInForm() {
  const router = useRouter();
  const session = useSession();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to dashboard if user is already signed in
  if (session.data) {
    const userData = session.data?.user;
    switch (userData.role) {
      case "ADMIN":
        router.push("/admin/dashboard");
        break;
      case "EXPERT":
        router.push("/expert/dashboard");
        break;
      default:
        router.push("/");
    }
  }
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false); // Loading state for the form submission
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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
    setIsLoading(true); // Start loading spinner
    const signInData = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signInData?.error) {
      setIsLoading(false); // Stop loading spinner on error
      toast({
        title: "Gagal masuk",
        description: "Email atau password salah",
        status: "error",
        isClosable: true,
        position: "bottom-right",
      });
    } else {
      // Fetch user role after successful login
      const response = await fetch("/api/user/me");
      const userData = await response.json();

      // Redirect based on role
      switch (userData.role) {
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        case "EXPERT":
          router.push("/expert/dashboard");
          break;
        default:
          router.push("/");
      }
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
            textAlign="center"
          >
            Selamat Datang Kembali
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            Masuk ke akun anda untuk melanjutkan ✌️
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

              <Stack spacing={4}>
                <Flex justify="space-between" align="center" fontSize="sm">
                  <Link
                    color="pink.500"
                    _hover={{ color: "pink.600" }}
                    fontWeight="medium"
                  >
                    Lupa Password?
                  </Link>
                  <Text>
                    Belum punya akun?{" "}
                    <Link
                      href="/signup"
                      color="pink.500"
                      _hover={{ color: "pink.600" }}
                      fontWeight="medium"
                    >
                      Daftar
                    </Link>
                  </Text>
                </Flex>

                <Button
                  type="submit"
                  bg="pink.400"
                  color="white"
                  _hover={{
                    bg: "pink.500",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s",
                  }}
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  borderRadius="lg"
                  w="full"
                >
                  Masuk
                </Button>
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
