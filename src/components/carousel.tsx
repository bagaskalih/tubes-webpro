"use client";
import React, { useState } from "react";
import { Box, Button, Flex, Text, IconButton } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useEffect } from "react";

enum ExpertSpecialty {
  NUTRISI_ANAK,
  PSIKOLOGI_ANAK,
  PARENTING,
  PERTUMBUHAN_ANAK,
  EDUKASI_ANAK,
}

interface Author {
  name: string;
  role: string;
  specialty?: ExpertSpecialty;
}

interface Artikel {
  id: number;
  title: string;
  content: string;
  image?: string;
  author: Author;
  createdAt: string;
  _count: {
    comments: number;
  };
}

export default function CardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [artikels, setArtikel] = useState<Artikel[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch("/api/posts");
      const data = await response.json();
      setArtikel(data);
    };
    fetchPosts();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === artikels.length - 4 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? artikels.length - 4 : prevIndex - 1
    );
  };

  return (
    <Box position="relative" w="full" maxW="7xl" mx="auto">
      <Box position="relative" overflow="hidden" px={4}>
        <Flex
          transition="transform 0.5s ease-in-out"
          transform={`translateX(-${currentIndex * (100 / 4)}%)`}
          gap={6}
        >
          {artikels.map((artikel) => (
            <Box
              key={artikel.id}
              flex="0 0 calc(25% - 24px)"
              minW="calc(25% - 24px)"
            >
              <Link href={`/artikel/${artikel.id}`}>
                <Box
                  h="320px"
                  position="relative"
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="md"
                  transition="transform 0.2s"
                  _hover={{ transform: "translateY(-4px)" }}
                  bg="white"
                  border="1px"
                  borderColor="gray.200"
                >
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    h="200px"
                    bgImage={artikel.image ? `url(${artikel.image})` : "none"}
                    bgColor={artikel.image ? "transparent" : "gray.100"}
                    bgSize="cover"
                    bgPosition="center"
                  />
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    p={6}
                    bg="white"
                    minH="120px"
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color="gray.800"
                      mb={2}
                      noOfLines={2}
                    >
                      {artikel.title}
                    </Text>
                    <Flex align="center" color="gray.500" fontSize="sm">
                      <Text fontWeight="medium">{artikel.author.name}</Text>
                      <Text mx={2}>•</Text>
                      <Text>
                        {new Date(artikel.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              </Link>
            </Box>
          ))}
        </Flex>
      </Box>

      {artikels.length > 4 && (
        <Flex justify="center" mt={6} gap={4}>
          <IconButton
            onClick={prevSlide}
            aria-label="Previous slide"
            icon={<ChevronLeftIcon boxSize={6} />}
            colorScheme="pink"
            variant="ghost"
            size="lg"
            isRound
            _hover={{ bg: "pink.50" }}
          />
          <IconButton
            onClick={nextSlide}
            aria-label="Next slide"
            icon={<ChevronRightIcon boxSize={6} />}
            colorScheme="pink"
            variant="ghost"
            size="lg"
            isRound
            _hover={{ bg: "pink.50" }}
          />
        </Flex>
      )}
    </Box>
  );
}
