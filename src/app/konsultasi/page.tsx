"use client";

import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Icon,
  useToast,
  Avatar,
  Badge,
  Container,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { subtitle } from "@/components/primitives";

interface Expert {
  id: number;
  name: string;
  specialty: string;
  about: string;
  image: string;
  rating: number;
  totalReviews: number;
}

enum ExpertSpecialty {
  NUTRISI_ANAK = "NUTRISI_ANAK",
  PSIKOLOGI_ANAK = "PSIKOLOGI_ANAK",
  PARENTING = "PARENTING",
  PERTUMBUHAN_ANAK = "PERTUMBUHAN_ANAK",
  EDUKASI_ANAK = "EDUKASI_ANAK",
}

const specialtyLabels: Record<ExpertSpecialty, string> = {
  NUTRISI_ANAK: "Nutrisi Anak",
  PSIKOLOGI_ANAK: "Psikologi Anak",
  PARENTING: "Parenting",
  PERTUMBUHAN_ANAK: "Pertumbuhan Anak",
  EDUKASI_ANAK: "Pendidikan Anak",
};

export default function KonsultasiDenganAhli() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const response = await fetch("/api/experts");
      const data = await response.json();
      setExperts(data.experts);
    } catch (error) {
      console.error("Error fetching experts:", error);
    }
  };

  const handleCardClick = (expert: Expert) => {
    setSelectedExpert(expert);
    onOpen();
  };

  const startConsultation = async () => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to start a consultation",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      router.push("/signin");
      return;
    }

    try {
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expertId: selectedExpert?.id,
        }),
      });

      const data = await response.json();
      if (data.chatRoomId) {
        router.push(`/chat/${data.chatRoomId}`);
      }
    } catch (error) {
      console.error("Error starting consultation:", error);
      toast({
        title: "Error",
        description: "Failed to start consultation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          as={i <= Math.floor(rating) ? FaStar : FaRegStar}
          key={i}
          color={i <= rating ? "yellow.400" : "gray.300"}
          boxSize={5}
        />
      );
    }
    return stars;
  };

  return (
    <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
      <Stack spacing={8}>
        <Box textAlign="center" mb={8}>
          <Heading className="text-4xl md:text-5xl font-bold tracking-tight">
            Konsultasi Dengan Ahli
          </Heading>
          <Text
            className={subtitle({
              class: "mt-4 max-w-2xl mx-auto text-xl text-gray-600",
            })}
          >
            Temukan Ahli yang Tepat untuk Mendampingi Perjalanan Pengasuhan Anda
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {experts.map((expert) => (
            <Box
              key={expert.id}
              bg="white"
              p={6}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="gray.200"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-4px)",
                shadow: "xl",
                borderColor: "pink.200",
                cursor: "pointer",
              }}
              onClick={() => handleCardClick(expert)}
            >
              <Stack spacing={4} align="center">
                <Avatar
                  size="2xl"
                  name={expert.name}
                  src={expert.image || "https://via.placeholder.com/150"}
                  ring={2}
                  ringColor="pink.400"
                />

                <Stack spacing={2} textAlign="center">
                  <Heading
                    size="md"
                    bgGradient="linear(to-r, pink.500, purple.500)"
                    bgClip="text"
                  >
                    {expert.name}
                  </Heading>

                  <Badge
                    px={3}
                    py={1}
                    colorScheme="pink"
                    rounded="full"
                    textTransform="capitalize"
                  >
                    {specialtyLabels[expert.specialty as ExpertSpecialty]}
                  </Badge>

                  <Stack spacing={1} align="center">
                    <Flex align="center" gap={2}>
                      {renderStars(expert.rating)}
                      <Text color="gray.500" fontSize="sm">
                        ({expert.totalReviews})
                      </Text>
                    </Flex>
                    <Text color="gray.600" fontSize="sm" noOfLines={2}>
                      {expert.about ||
                        "Siap membantu memberikan solusi terbaik untuk Anda"}
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>

      {selectedExpert && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent rounded="xl">
            <ModalHeader
              bgGradient="linear(to-r, pink.400, purple.500)"
              color="white"
              roundedTop="xl"
            >
              Detail Ahli
            </ModalHeader>
            <ModalCloseButton color="white" />

            <ModalBody py={6}>
              <Stack spacing={6} align="center">
                <Avatar
                  size="2xl"
                  name={selectedExpert.name}
                  src={
                    selectedExpert.image || "https://via.placeholder.com/150"
                  }
                  ring={2}
                  ringColor="pink.400"
                />

                <Stack spacing={4} textAlign="center">
                  <Stack spacing={2}>
                    <Heading
                      size="lg"
                      bgGradient="linear(to-r, pink.500, purple.500)"
                      bgClip="text"
                    >
                      {selectedExpert.name}
                    </Heading>

                    <Badge
                      px={3}
                      py={1}
                      colorScheme="pink"
                      rounded="full"
                      textTransform="capitalize"
                    >
                      {
                        specialtyLabels[
                          selectedExpert.specialty as ExpertSpecialty
                        ]
                      }
                    </Badge>
                  </Stack>

                  <Flex justify="center" align="center" gap={2}>
                    {renderStars(selectedExpert.rating)}
                    <Text color="gray.500" fontSize="sm">
                      ({selectedExpert.totalReviews} ulasan)
                    </Text>
                  </Flex>

                  <Text color="gray.700">{selectedExpert.about}</Text>
                </Stack>
              </Stack>
            </ModalBody>

            <ModalFooter gap={3}>
              <Button
                bgGradient="linear(to-r, pink.400, purple.500)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, pink.500, purple.600)",
                }}
                onClick={startConsultation}
                flex={1}
              >
                Mulai Konsultasi
              </Button>

              <Button
                variant="ghost"
                onClick={onClose}
                _hover={{
                  bg: "gray.100",
                }}
              >
                Tutup
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}
