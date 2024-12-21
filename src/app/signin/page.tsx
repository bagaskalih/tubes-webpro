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
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useState } from "react";

// Define the schema for validation using zod
const FormSchema = z.object({
  email: z
    .string()
    .email("Email tidak valid")
    .nonempty("Email tidak boleh kosong"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export default function SignInForm() {
  const toast = useToast();
  const router = useRouter();
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
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Masuk ke akun anda</Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              {/* Email Input */}
              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel>Alamat Email</FormLabel>
                <Input type="email" {...register("email")} />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              {/* Password Input */}
              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input type="password" {...register("password")} />
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              {/* Remember Me and Forgot Password */}
              <Stack spacing={5} mb={5}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Link color="teal.500">Lupa Password?</Link>
                </Stack>
                <Text alignSelf="end">
                  Belum punya akun?{" "}
                  <Link color="teal.500" href="/signup">
                    Daftar
                  </Link>
                </Text>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  w={"40%"}
                  alignSelf={"end"}
                  isLoading={isLoading} // Show loading spinner
                >
                  Masuk
                </Button>
              </Stack>

              {/* Google Sign-In Button */}
              <Button
                w={"full"}
                maxW={"md"}
                variant={"outline"}
                leftIcon={<FcGoogle />}
                onClick={() => signIn("google")}
              >
                <Center>
                  <Text>Teruskan dengan Google</Text>
                </Center>
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}
