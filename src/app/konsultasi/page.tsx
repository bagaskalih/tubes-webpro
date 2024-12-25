"use client";

import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Image,
  useColorModeValue,
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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Expert {
  id: number;
  name: string;
  specialty: string;
  about: string;
  profileImage: string;
  rating: number;
  totalReviews: number;
}

enum ExpertSpecialty {
  NUTRISI_ANAK = "NUTRISI_ANAK",
  PSIKOLOGI_ANAK = "PSIKOLOGI_ANAK",
  PARENTING = "PARENTING",
  PERKEMBANGAN_ANAK = "PERKEMBANGAN_ANAK",
  EDUKASI_ANAK = "EDUKASI_ANAK",
}

const specialtyLabels: Record<ExpertSpecialty, string> = {
  NUTRISI_ANAK: "Nutrisi Anak",
  PSIKOLOGI_ANAK: "Psikologi Anak",
  PARENTING: "Parenting",
  PERKEMBANGAN_ANAK: "Perkembangan Anak",
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
    <Flex
      minH={"100vh"}
      direction={"column"}
      align={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
      p={4}
    >
      <Heading mb={6}>Daftar Ahli</Heading>
      <Stack spacing={6} w={"full"} maxW={"3xl"}>
        {experts.map((expert) => (
          <Box
            key={expert.id}
            p={4}
            boxShadow={"md"}
            rounded={"md"}
            display={"flex"}
            alignItems={"center"}
            gap={4}
            _hover={{ boxShadow: "lg", cursor: "pointer" }}
            onClick={() => handleCardClick(expert)}
          >
            <Avatar
              size={"xl"}
              name={expert.name}
              src={expert.profileImage || "https://via.placeholder.com/150"}
            />
            <Box>
              <Text fontWeight={"bold"} fontSize={"lg"}>
                {expert.name}
              </Text>
              <Text color={"gray.500"}>
                {specialtyLabels[expert.specialty as ExpertSpecialty]}
              </Text>
              <Flex mt={2} alignItems="center" gap={2}>
                {renderStars(expert.rating)}
                <Text color="gray.500" fontSize="sm">
                  ({expert.totalReviews} reviews)
                </Text>
              </Flex>
            </Box>
          </Box>
        ))}
      </Stack>

      {selectedExpert && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedExpert.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction={"column"} align={"center"} textAlign={"center"}>
                <Avatar
                  size={"xl"}
                  name={selectedExpert.name}
                  src={
                    selectedExpert.profileImage ||
                    "https://via.placeholder.com/150"
                  }
                  mb={4}
                />
                <Text fontWeight={"bold"} fontSize={"lg"} mb={2}>
                  {selectedExpert.name}
                </Text>
                <Text fontWeight={"bold"} fontSize={"lg"} mb={2}>
                  {specialtyLabels[selectedExpert.specialty as ExpertSpecialty]}
                </Text>
                <Flex mb={4} alignItems="center" gap={2}>
                  {renderStars(selectedExpert.rating)}
                  <Text color="gray.500" fontSize="sm">
                    ({selectedExpert.totalReviews} reviews)
                  </Text>
                </Flex>
                <Text textAlign={"justify"}>{selectedExpert.about}</Text>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" mr={3} onClick={startConsultation}>
                Mulai Konsultasi
              </Button>
              <Button colorScheme="blue" onClick={onClose}>
                Tutup
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Flex>
  );
}
