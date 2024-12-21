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
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

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
  const [isLoading, setIsLoading] = useState(false); // Loading state for the form submission
  const toast = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Initialize react-hook-form with zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  // Function to handle form submission
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true); // Start loading spinner
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
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6} w="100%">
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              {/* Name Input */}
              <FormControl id="name" isInvalid={!!errors.name}>
                <FormLabel>Nama</FormLabel>
                <Input type="text" {...register("name")} />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              {/* Email Input */}
              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel>Alamat Email</FormLabel>
                <Input type="email" {...register("email")} />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              {/* Password Input */}
              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <InputRightElement h={"full"}>
                    <Button
                      variant={"ghost"}
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              {/* Submit Button */}
              <Stack spacing={10} pt={2}>
                <Button
                  loadingText="Submitting"
                  size="lg"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  onClick={handleSubmit(onSubmit)}
                  isLoading={isLoading}
                >
                  Sign up
                </Button>
              </Stack>

              {/* Link to Sign In */}
              <Stack pt={6}>
                <Text align={"center"}>
                  Sudah punya akun?{" "}
                  <Link color={"blue.400"} href="/signin">
                    Masuk
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}
