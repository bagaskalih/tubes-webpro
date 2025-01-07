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
  Textarea,
} from "@chakra-ui/react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import type { User } from "@/types";

enum ExpertSpecialty {
  NUTRISI_ANAK = "NUTRISI_ANAK",
  PSIKOLOGI_ANAK = "PSIKOLOGI_ANAK",
  PARENTING = "PARENTING",
  PERTUMBUHAN_ANAK = "PERTUMBUHAN_ANAK",
  EDUKASI_ANAK = "EDUKASI_ANAK",
}

const createUserSchema = z
  .object({
    name: z.string().nonempty("Nama tidak boleh kosong"),
    email: z
      .string()
      .email("Email tidak valid")
      .nonempty("Email tidak boleh kosong"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    role: z.enum(["EXPERT", "USER"]),
    specialty: z.nativeEnum(ExpertSpecialty).optional(),
    about: z.string().optional(),
    image: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "EXPERT") {
        return data.specialty !== undefined && data.about !== undefined;
      }
      return true;
    },
    {
      message: "Specialty and About are required for experts",
      path: ["specialty"],
    }
  );

type FormData = z.infer<typeof createUserSchema>;

const specialtyLabels: Record<ExpertSpecialty, string> = {
  NUTRISI_ANAK: "Nutrisi Anak",
  PSIKOLOGI_ANAK: "Psikologi Anak",
  PARENTING: "Parenting",
  PERTUMBUHAN_ANAK: "Pertumbuhan Anak",
  EDUKASI_ANAK: "Pendidikan Anak",
};

export default function CreateUserForm() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "USER",
    },
  });

  const role = useWatch({
    control,
    name: "role",
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
      console.log("Creating user:", values);
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
        fetchUsers();
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
      console.error("Error creating user:", error);
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

                {role === "EXPERT" && (
                  <>
                    <FormControl isInvalid={!!errors.specialty}>
                      <FormLabel>Bidang Keahlian</FormLabel>
                      <Select {...register("specialty")}>
                        <option value="">Pilih Bidang Keahlian</option>
                        {Object.entries(specialtyLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </Select>
                      <FormErrorMessage>
                        {errors.specialty?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.about}>
                      <FormLabel>Tentang</FormLabel>
                      <Textarea
                        {...register("about")}
                        placeholder="Masukkan deskripsi tentang keahlian dan pengalaman Anda"
                        rows={4}
                      />
                      <FormErrorMessage>
                        {errors.about?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.image}>
                      <FormLabel>URL Foto Profil</FormLabel>
                      <Input
                        {...register("image")}
                        placeholder="Masukkan URL foto profil"
                      />
                      <FormErrorMessage>
                        {errors.image?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </>
                )}

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
                    <Th>Bidang Keahlian</Th>
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
                        {user.specialty
                          ? specialtyLabels[user.specialty as ExpertSpecialty]
                          : "-"}
                      </Td>
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
