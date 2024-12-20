"use client";
import React, { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";

const cards = [
  {
    id: 1,
    title: "Card 1",
    description: "This is the first card",
    imgUrl: "https://picsum.photos/seed/1/200/300",
  },
  {
    id: 2,
    title: "Card 2",
    description: "This is the second card",
    imgUrl: "https://picsum.photos/seed/2/200/300",
  },
  {
    id: 3,
    title: "Card 3",
    description: "This is the third card",
    imgUrl: "https://picsum.photos/seed/3/200/300",
  },
  {
    id: 4,
    title: "Card 4",
    description: "This is the fourth card",
    imgUrl: "https://picsum.photos/seed/4/200/300",
  },
  {
    id: 5,
    title: "Card 5",
    description: "This is the fifth card",
    imgUrl: "https://picsum.photos/seed/5/200/300",
  },
  {
    id: 6,
    title: "Card 6",
    description: "This is the sixth card",
    imgUrl: "https://picsum.photos/seed/6/200/300",
  },
  {
    id: 7,
    title: "Card 7",
    description: "This is the seventh card",
    imgUrl: "https://picsum.photos/seed/7/200/300",
  },
];

export default function CardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === cards.length - 4 ? 0 : prevIndex + 1
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
          {cards.map((card) => (
            <Box
              key={card.id}
              minW={{ base: "100%", lg: "24%" }}
              maxW={{ base: "100%", lg: "24%" }}
              minH="150px"
              p={4}
              borderWidth="2px"
              borderRadius="lg"
              mr={{ base: 0, lg: 3 }}
              mb={{ base: 4, lg: 0 }}
              bgImage={`url(${card.imgUrl})`}
              bgSize="cover"
            >
              <Link href={`/card/${card.id}`}>
                <Text fontSize="xl" fontWeight="bold" color={"white"}>
                  {card.title}
                </Text>
                <Text color={"white"}>{card.description}</Text>
              </Link>
            </Box>
          ))}
        </Flex>
      </Flex>
      <Flex justify="flex-end" mt={2}>
        <Button onClick={nextSlide} colorScheme="blue">
          Next
        </Button>
      </Flex>
    </Box>
  );
}
