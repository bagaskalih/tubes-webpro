import { title, subtitle } from "@/components/primitives";
import { SearchBar } from "@/components/search-bar";
import Carousel from "@/components/carousel";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Portal Online</span>
        <br />
        <span className={title()}>Orangtua Pintar</span>
        <div className={subtitle({ class: "mt-4" })}>
          Solusi Modern untuk Orang Tua Cerdas.
        </div>
      </div>

      <div className="flex w-3/6">
        <SearchBar />
      </div>

      {/* carousel */}
      <Carousel />
    </section>
  );
}
