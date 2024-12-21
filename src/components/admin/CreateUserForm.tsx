"use client";

import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Select,
  useToast,
  FormErrorMessage,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import type { User } from "@/types";

// Define form schema
const createUserSchema = z.object({
  name: z.string().nonempty("Nama tidak boleh kosong"),
  email: z
    .string()
    .email("Email tidak valid")
    .nonempty("Email tidak boleh kosong"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["EXPERT", "USER"]),
});

type FormData = z.infer<typeof createUserSchema>;

export default function CreateUserForm() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "USER",
    },
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (values: FormData) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Akun berhasil dibuat",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        reset();
        fetchUsers(); // Refresh the user list
      } else {
        toast({
          title: "Gagal",
          description: data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="6xl" mx="auto" py={8} px={4}>
      <Stack spacing={8}>
        <Card>
          <CardHeader>
            <Heading size="lg">Buat Akun Baru</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Nama</FormLabel>
                  <Input {...register("name")} />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" {...register("email")} />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...register("password")} />
                  <FormErrorMessage>
                    {errors.password?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.role}>
                  <FormLabel>Role</FormLabel>
                  <Select {...register("role")}>
                    <option value="USER">User</option>
                    <option value="EXPERT">Expert</option>
                  </Select>
                  <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
                </FormControl>

                <Button
                  mt={4}
                  colorScheme="blue"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Buat Akun
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="lg">Daftar Pengguna</Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Nama</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Tanggal Dibuat</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.id}>
                      <Td>{user.name}</Td>
                      <Td>{user.email}</Td>
                      <Td>{user.role}</Td>
                      <Td>
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}
