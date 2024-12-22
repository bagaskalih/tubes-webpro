"use client";

import {
  Box,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const listLayanan = [
  {
    title: "PANDUAN PARENTING",
    link: "#",
  },
  {
    title: "KONSULTASI DENGAN AHLI",
    link: "konsultasi",
  },
  {
    title: "FORUM KOMUNITAS",
    link: "forum",
  },
  {
    title: "AKSES BERITA TERKINI",
    link: "news",
  },
];

export default function Layanan() {
  return (
    <Flex
      minH={"100vh"}
      direction={"column"}
      align={"center"}
      justify={"start"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      {/* Header */}
      <Heading fontSize={"2xl"} mt={8} mb={6}>
        Layanan kami
      </Heading>

      {/* Container Box */}
      <Box
        w={{ base: "90%", md: "50%" }}
        bg={"gray.300"}
        borderRadius={"lg"}
        boxShadow={"lg"}
        p={4}
      >
        <Stack spacing={4}>
          {listLayanan.map((item, index) => (
            <Link key={item.link} href={`/${item.link}`}>
              <Box
                key={index}
                bg={"gray.200"}
                p={6}
                rounded={"md"}
                textAlign={"center"}
                boxShadow={"md"}
                _hover={{
                  bg: "gray.100",
                }}
              >
                <Text fontWeight={"bold"}>{item.title}</Text>
              </Box>
            </Link>
          ))}
        </Stack>
      </Box>
    </Flex>
  );
}
