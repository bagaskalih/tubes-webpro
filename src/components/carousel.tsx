"use client";
import React, { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
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

  return (
    <Box w="100%" maxW="80%" mx="auto" p={4}>
      <Flex overflow="hidden">
        <Flex
          flexDirection={{ base: "column", lg: "row" }}
          transition="all 0.5s"
          transform={{
            base: "none",
            lg: `translateX(-${currentIndex * 26}%)`,
            xl: `translateX(-${currentIndex * 25}%)`,
          }}
          mx="auto"
          w={{ base: "100%", lg: "100%" }}
        >
          {artikels.map((artikel) => (
            <Box
              key={artikel.id}
              minW={{ base: "100%", lg: "24%" }}
              maxW={{ base: "100%", lg: "24%" }}
              minH="150px"
              p={4}
              borderWidth="2px"
              borderRadius="lg"
              mr={{ base: 0, lg: 3 }}
              mb={{ base: 4, lg: 0 }}
              bgImage={`url(${artikel.image})`}
              bgSize="cover"
            >
              <Link href={`/artikel/${artikel.id}`}>
                <Text fontSize="xl" fontWeight="bold" color={"black"}>
                  {artikel.title}
                </Text>
              </Link>
            </Box>
          ))}
        </Flex>
      </Flex>
      {artikels.length > 4 && (
        <Flex justify="flex-end" mt={2}>
          <Button onClick={nextSlide} colorScheme="blue">
            Next
          </Button>
        </Flex>
      )}
    </Box>
  );
}
