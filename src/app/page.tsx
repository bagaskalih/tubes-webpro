// page.tsx
import { title, subtitle } from "@/components/primitives";
import Carousel from "@/components/carousel";
import { Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-6 mb-12">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          <span className={title()}>Portal Online</span>
          <br />
          <span
            className={title({
              class:
                "bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text",
            })}
          >
            Orangtua Pintar
          </span>
        </h1>
        <p
          className={subtitle({
            class: "max-w-2xl mx-auto text-xl text-gray-600",
          })}
        >
          Solusi Modern untuk Orang Tua Cerdas.
        </p>
      </div>

      <div className="text-center space-y-6 mb-12 mt-5">
        <Text fontSize="2xl" fontWeight="bold" color="gray.900">
          ARTIKEL TERKINI
        </Text>
        <Carousel />
      </div>
    </section>
  );
}
