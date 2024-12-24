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
} from "@chakra-ui/react";
import Link from "next/link";

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
    <Box maxW="6xl" mx="auto" py={8} px={4}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg" mb={4}>
            Selamat Datang Kembali, Dr. {session.user.name}
          </Heading>
          <Button
            as={Link}
            href="/create-post"
            colorScheme="green"
            width="fit-content"
          >
            Tulis Artikel Baru
          </Button>
        </Box>

        <StatGroup>
          <Stat>
            <StatLabel>Active Consultations</StatLabel>
            <StatNumber>{stats.activeChatCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Consultations</StatLabel>
            <StatNumber>{stats.totalConsultations}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Rating</StatLabel>
            <StatNumber>{stats.rating.toFixed(1)}/5</StatNumber>
            <Text fontSize="sm" color="gray.500">
              Dari {stats.totalReviews} review
            </Text>
          </Stat>
        </StatGroup>

        <Box>
          <Heading size="md" mb={4}>
            Konsultasi Aktif
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {activeChats.map((chat) => (
              <Card key={chat.id}>
                <CardHeader>
                  <HStack spacing={4}>
                    <Avatar size="sm" name={chat.user.name} />
                    <Box>
                      <Text fontWeight="bold">{chat.user.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {chat.user.email}
                      </Text>
                    </Box>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Stack spacing={3}>
                    <HStack>
                      <Badge colorScheme="green">Aktif</Badge>
                      {chat.messages.length === 0 && (
                        <Badge colorScheme="red">New</Badge>
                      )}
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      Last message:{" "}
                      {chat.messages[0]?.content.slice(0, 50) + "..." ||
                        "No messages yet"}
                    </Text>
                    <Button
                      as={Link}
                      href={`/chat/${chat.id}`}
                      size="sm"
                      width="full"
                    >
                      View Chat
                    </Button>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </Stack>
    </Box>
  );
}
