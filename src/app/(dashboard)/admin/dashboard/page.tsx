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
        <Stack direction="row" spacing={4}>
          <Button
            as={Link}
            href="/admin/create-user"
            colorScheme="blue"
            width="fit-content"
          >
            Kelola Pengguna
          </Button>
          <Button
            as={Link}
            href="/create-post"
            colorScheme="green"
            width="fit-content"
          >
            Buat Post Baru
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
