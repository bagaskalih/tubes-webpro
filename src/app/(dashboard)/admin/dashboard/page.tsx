import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { Users, Edit3 } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/signin");
  }

  return (
    <Container maxW="7xl" py={8}>
      <Stack spacing={8}>
        <Box textAlign="center" mb={8}>
          <Heading
            as="h1"
            fontSize="4xl"
            fontWeight="bold"
            bgGradient="linear(to-r, pink.500, purple.500)"
            bgClip="text"
            mb={4}
          >
            Panel Admin
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
            Kelola pengguna dan konten Portal Online Orangtua Pintar
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <Card
            variant="outline"
            borderColor="gray.200"
            _hover={{ borderColor: "pink.200", shadow: "md" }}
            transition="all 0.2s"
          >
            <CardBody>
              <Stack spacing={4}>
                <Flex align="center" gap={3}>
                  <Users size={24} className="text-pink-500" />
                  <Heading size="md">Kelola Pengguna</Heading>
                </Flex>
                <Text color="gray.600">Tambah akun pengguna dan pakar</Text>
                <Button
                  as={Link}
                  href="/admin/create-user"
                  colorScheme="pink"
                  size="lg"
                  rightIcon={<Users size={20} />}
                  rounded="full"
                >
                  Kelola Pengguna
                </Button>
              </Stack>
            </CardBody>
          </Card>

          <Card
            variant="outline"
            borderColor="gray.200"
            _hover={{ borderColor: "purple.200", shadow: "md" }}
            transition="all 0.2s"
          >
            <CardBody>
              <Stack spacing={4}>
                <Flex align="center" gap={3}>
                  <Edit3 size={24} className="text-purple-500" />
                  <Heading size="md">Kelola Artikel</Heading>
                </Flex>
                <Text color="gray.600">Publish dan kelola artikel</Text>
                <Button
                  as={Link}
                  href="/create-post"
                  colorScheme="purple"
                  size="lg"
                  rightIcon={<Edit3 size={20} />}
                  rounded="full"
                >
                  Kelola Artikel
                </Button>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
      </Stack>
    </Container>
  );
}
