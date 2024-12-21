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
} from "@chakra-ui/react";
import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa"; // Ikon bintang

interface Ahli {
  id: number;
  name: string;
  profession: string;
  description: string;
  image: string;
  rating: number; // Tambahkan rating di data
}

const dataAhli: Ahli[] = [
  {
    id: 1,
    name: "Dr. Andi Saputra",
    profession: "Psikolog Anak",
    description:
      "Dr. Andi adalah seorang psikolog berpengalaman dalam bidang tumbuh kembang anak.",
    image: "https://via.placeholder.com/150",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Dr. Siti Rahmawati",
    profession: "Konsultan Parenting",
    description:
      "Dr. Siti adalah konsultan yang membantu orang tua dalam mendidik anak.",
    image: "https://via.placeholder.com/150",
    rating: 5,
  },
  {
    id: 3,
    name: "Dr. Budi Santoso",
    profession: "Ahli Gizi Anak",
    description:
      "Dr. Budi spesialis gizi yang fokus pada nutrisi seimbang untuk anak.",
    image: "https://via.placeholder.com/150",
    rating: 4,
  },
];

export default function KonsultasiDenganAhli() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAhli, setSelectedAhli] = useState<Ahli | null>(null);

  const handleCardClick = (ahli: Ahli) => {
    setSelectedAhli(ahli);
    onOpen();
  };

  // Komponen untuk menampilkan bintang berdasarkan rating
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
        {dataAhli.map((ahli) => (
          <Box
            key={ahli.id}
            p={4}
            boxShadow={"md"}
            rounded={"md"}
            display={"flex"}
            alignItems={"center"}
            gap={4}
            _hover={{ boxShadow: "lg", cursor: "pointer" }}
            onClick={() => handleCardClick(ahli)}
          >
            <Image
              borderRadius="full"
              boxSize="75px"
              src={ahli.image}
              alt={ahli.name}
            />
            <Box>
              <Text fontWeight={"bold"} fontSize={"lg"}>
                {ahli.name}
              </Text>
              <Text color={"gray.500"}>{ahli.profession}</Text>
              <Flex mt={2}>{renderStars(ahli.rating)}</Flex>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Modal Profil Ahli */}
      {selectedAhli && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedAhli.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction={"column"} align={"center"} textAlign={"center"}>
                <Image
                  borderRadius="full"
                  boxSize="150px"
                  src={selectedAhli.image}
                  alt={selectedAhli.name}
                  mb={4}
                />
                <Text fontWeight={"bold"} fontSize={"lg"} mb={2}>
                  {selectedAhli.profession}
                </Text>
                <Flex mb={4}>{renderStars(selectedAhli.rating)}</Flex>
                <Text textAlign={"justify"}>{selectedAhli.description}</Text>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" mr={3}>
                Mulai Konsultasi
              </Button>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Tutup
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Flex>
  );
}
