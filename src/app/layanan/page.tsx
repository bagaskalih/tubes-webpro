"use client";

import { MessageCircle, Users, BookOpen } from "lucide-react";
import {
  Container,
  Stack,
  Box,
  Heading,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";
import { title, subtitle } from "@/components/primitives";

const listLayanan = [
  {
    title: "Konsultasi Online Dengan Ahli",
    description: "Konsultasi langsung dengan ahli pengasuhan anak",
    link: "konsultasi",
    icon: MessageCircle,
  },
  {
    title: "Forum Komunitas",
    description: "Bergabung dengan komunitas orang tua lainnya",
    link: "forum",
    icon: Users,
  },
  {
    title: "Akses Artikel Terkini",
    description: "Artikel terbaru seputar pengasuhan anak",
    link: "artikel",
    icon: BookOpen,
  },
];

export default function Layanan() {
  return (
    <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
      <Stack spacing={8} mb={12}>
        <Box textAlign="center">
          <Heading
            className={title({
              class: "text-4xl md:text-5xl font-bold tracking-tight",
            })}
          >
            Layanan Kami
          </Heading>
          <Text
            className={subtitle({
              class: "mt-4 max-w-2xl mx-auto text-xl text-gray-600",
            })}
          >
            Solusi Lengkap untuk Mendukung Perjalanan Pengasuhan Anda
          </Text>
        </Box>

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={8}
          px={{ base: 4, lg: 8 }}
        >
          {listLayanan.map((item) => (
            <Link key={item.link} href={`/${item.link}`}>
              <Box
                p={6}
                height="full"
                bg="white"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-4px)",
                  shadow: "xl",
                  borderColor: "pink.200",
                }}
              >
                <Stack spacing={4}>
                  <Box p={3} borderRadius="lg" bg="pink.50" width="fit-content">
                    <item.icon className="w-6 h-6 text-pink-500" />
                  </Box>

                  <Stack spacing={2}>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      bgGradient="linear(to-r, pink.500, purple.500)"
                      bgClip="text"
                    >
                      {item.title}
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      {item.description}
                    </Text>
                  </Stack>
                </Stack>
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
