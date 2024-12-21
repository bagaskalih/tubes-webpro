// src/app/(dashboard)/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Box, Button, Heading, Stack } from "@chakra-ui/react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/signin");
  }

  return (
    <Box maxW="4xl" mx="auto" py={8} px={4}>
      <Stack spacing={6}>
        <Heading>Admin Dashboard</Heading>
        <Button
          as={Link}
          href="/admin/create-user"
          colorScheme="blue"
          width="fit-content"
        >
          Kelola Pengguna
        </Button>
      </Stack>
    </Box>
  );
}
