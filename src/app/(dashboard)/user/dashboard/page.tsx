import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  HStack,
  Avatar,
  Badge,
  Container,
  Grid,
} from "@chakra-ui/react";
import Link from "next/link";
import { Star, MessageCircle } from "lucide-react";

async function getUserChats(userId: number) {
  return await db.chatRoom.findMany({
    where: { userId: userId },
    include: {
      expert: {
        select: {
          name: true,
          image: true,
          specialty: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      review: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "USER") {
    redirect("/signin");
  }

  const chats = await getUserChats(parseInt(session.user.id));

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
            Selamat Datang, {session?.user?.name}
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
            Mulai konsultasi dengan pakar kami
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          <Stack spacing={8}>
            <Box>
              <Heading
                size="lg"
                mb={6}
                bgGradient="linear(to-r, pink.500, purple.500)"
                bgClip="text"
              >
                Konsultasi Anda
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {chats.map((chat) => (
                  <Card
                    key={chat.id}
                    variant="outline"
                    borderColor="gray.200"
                    _hover={{ borderColor: "pink.200", shadow: "md" }}
                    transition="all 0.2s"
                  >
                    <CardHeader>
                      <HStack spacing={4}>
                        <Avatar
                          size="md"
                          name={chat.expert.name}
                          src={chat.expert.image ?? undefined}
                          ring={2}
                          ringColor="pink.400"
                        />
                        <Box>
                          <Text fontWeight="bold" fontSize="lg">
                            {chat.expert.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {chat.expert.specialty}
                          </Text>
                        </Box>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <Stack spacing={4}>
                        <HStack>
                          <Badge
                            colorScheme={
                              chat.status === "ACTIVE" ? "green" : "gray"
                            }
                            px={3}
                            py={1}
                            rounded="full"
                          >
                            {chat.status}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {chat.messages[0]?.content || "Belum ada pesan"}
                        </Text>
                        {chat.review && (
                          <HStack spacing={1}>
                            <Star
                              size={16}
                              className="text-yellow-400 fill-yellow-400"
                            />
                            <Text fontSize="sm" color="gray.600">
                              {chat.review.rating}/5
                            </Text>
                          </HStack>
                        )}
                        <Button
                          as={Link}
                          href={`/chat/${chat.id}`}
                          size="md"
                          width="full"
                          colorScheme="pink"
                          rightIcon={<MessageCircle size={20} />}
                          rounded="full"
                        >
                          Buka Chat
                        </Button>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>
          </Stack>

          <Stack spacing={6}>
            <Button
              as={Link}
              href="/konsultasi"
              size="lg"
              colorScheme="purple"
              rightIcon={<MessageCircle size={20} />}
              rounded="full"
              height={14}
            >
              Mulai Konsultasi Baru
            </Button>

            <Card
              variant="outline"
              borderColor="gray.200"
              _hover={{ borderColor: "purple.200" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Stack spacing={4}>
                  <Heading size="md">Ringkasan Konsultasi</Heading>
                  <Stack spacing={3}>
                    <HStack justify="space-between">
                      <Text color="gray.600">Total Konsultasi</Text>
                      <Text fontWeight="bold">{chats.length}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Konsultasi Aktif</Text>
                      <Text fontWeight="bold">
                        {
                          chats.filter((chat) => chat.status === "ACTIVE")
                            .length
                        }
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Rating Diberikan</Text>
                      <Text fontWeight="bold">
                        {chats.filter((chat) => chat.review).length}
                      </Text>
                    </HStack>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </Container>
  );
}
