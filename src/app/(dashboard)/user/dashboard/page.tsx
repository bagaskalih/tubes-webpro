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
} from "@chakra-ui/react";
import Link from "next/link";

async function getUserChats(userId: number) {
  return await db.chatRoom.findMany({
    where: { userId: userId },
    include: {
      expert: {
        select: {
          name: true,
          profileImage: true,
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
    <Box maxW="6xl" mx="auto" py={8} px={4}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg" mb={4}>
            Welcome back, {session.user.name}
          </Heading>
          <Button
            as={Link}
            href="/konsultasi"
            colorScheme="blue"
            width="fit-content"
          >
            Start New Consultation
          </Button>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            Your Consultations
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {chats.map((chat) => (
              <Card key={chat.id}>
                <CardHeader>
                  <HStack spacing={4}>
                    <Avatar
                      size="sm"
                      name={chat.expert.name}
                      src={chat.expert.profileImage ?? undefined}
                    />
                    <Box>
                      <Text fontWeight="bold">{chat.expert.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {chat.expert.specialty}
                      </Text>
                    </Box>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Stack spacing={3}>
                    <Text fontSize="sm" color="gray.600">
                      Last message:{" "}
                      {chat.messages[0]?.content.slice(0, 50) + "..." ||
                        "No messages yet"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Status: {chat.status}
                    </Text>
                    {chat.review && (
                      <Text fontSize="sm" color="gray.500">
                        Your rating: {chat.review.rating}/5
                      </Text>
                    )}
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
