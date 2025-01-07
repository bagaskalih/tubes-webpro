// app/(dashboard)/expert/dashboard/page.tsx
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
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Container,
  Grid,
} from "@chakra-ui/react";
import Link from "next/link";
import { MessageCircle, Edit3 } from "lucide-react";

async function getExpertStats(expertId: number) {
  const activeChatCount = await db.chatRoom.count({
    where: {
      expertId: expertId,
      status: "ACTIVE",
    },
  });

  const totalConsultations = await db.chatRoom.count({
    where: {
      expertId: expertId,
    },
  });

  const expert = await db.user.findUnique({
    where: { id: expertId },
    select: {
      rating: true,
      totalReviews: true,
    },
  });

  return {
    activeChatCount,
    totalConsultations,
    rating: expert?.rating || 0,
    totalReviews: expert?.totalReviews || 0,
  };
}

async function getExpertChats(expertId: number) {
  return await db.chatRoom.findMany({
    where: {
      expertId: expertId,
      status: "ACTIVE",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export default async function ExpertDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "EXPERT") {
    redirect("/signin");
  }

  const stats = await getExpertStats(parseInt(session.user.id));
  const activeChats = await getExpertChats(parseInt(session.user.id));

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
            Selamat Datang Kembali, Dr. {session?.user?.name}
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
            Panel Pakar Portal Online Orangtua Pintar
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          <Stack spacing={8}>
            <Card
              variant="outline"
              borderColor="gray.200"
              _hover={{ borderColor: "pink.200" }}
              transition="all 0.2s"
            >
              <CardBody>
                <StatGroup>
                  <Stat>
                    <StatLabel fontSize="lg" color="gray.600">
                      Konsultasi Aktif
                    </StatLabel>
                    <StatNumber
                      fontSize="4xl"
                      bgGradient="linear(to-r, pink.500, purple.500)"
                      bgClip="text"
                    >
                      {stats.activeChatCount}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize="lg" color="gray.600">
                      Total Konsultasi
                    </StatLabel>
                    <StatNumber
                      fontSize="4xl"
                      bgGradient="linear(to-r, pink.500, purple.500)"
                      bgClip="text"
                    >
                      {stats.totalConsultations}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel fontSize="lg" color="gray.600">
                      Rating
                    </StatLabel>
                    <StatNumber
                      fontSize="4xl"
                      bgGradient="linear(to-r, pink.500, purple.500)"
                      bgClip="text"
                    >
                      {stats.rating.toFixed(1)}/5
                    </StatNumber>
                    <Text fontSize="sm" color="gray.500">
                      Dari {stats.totalReviews} review
                    </Text>
                  </Stat>
                </StatGroup>
              </CardBody>
            </Card>

            <Box>
              <Heading
                size="lg"
                mb={6}
                bgGradient="linear(to-r, pink.500, purple.500)"
                bgClip="text"
              >
                Konsultasi Aktif
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {activeChats.map((chat) => (
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
                          name={chat.user.name}
                          ring={2}
                          ringColor="pink.400"
                        />
                        <Box>
                          <Text fontWeight="bold" fontSize="lg">
                            {chat.user.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {chat.user.email}
                          </Text>
                        </Box>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <Stack spacing={4}>
                        <HStack>
                          <Badge
                            colorScheme="green"
                            px={3}
                            py={1}
                            rounded="full"
                          >
                            Aktif
                          </Badge>
                          {chat.messages.length === 0 && (
                            <Badge
                              colorScheme="red"
                              px={3}
                              py={1}
                              rounded="full"
                            >
                              Baru
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {chat.messages[0]?.content || "Belum ada pesan"}
                        </Text>
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
              href="/create-post"
              size="lg"
              colorScheme="purple"
              rightIcon={<Edit3 size={20} />}
              rounded="full"
              height={14}
            >
              Tulis Artikel Baru
            </Button>

            <Card
              variant="outline"
              borderColor="gray.200"
              _hover={{ borderColor: "purple.200" }}
              transition="all 0.2s"
            >
              <CardBody>
                <Stack spacing={4}>
                  <Heading size="md">Performa Anda</Heading>
                  <Stack spacing={3}>
                    <HStack justify="space-between">
                      <Text color="gray.600">Response Rate</Text>
                      <Text fontWeight="bold">98%</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Avg. Response Time</Text>
                      <Text fontWeight="bold">15 menit</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Client Satisfaction</Text>
                      <Text fontWeight="bold">4.9/5</Text>
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
