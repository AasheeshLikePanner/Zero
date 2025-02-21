"use client";

import HeroImage from "@/components/home/hero-image";
import Navbar from "@/components/home/navbar";
import Hero from "@/components/home/hero";

export default function Home() {
  return (
    <div className="relative h-screen min-h-screen w-full overflow-y-scroll scroll-smooth bg-grid-small-black/[0.39] dark:bg-grid-small-white/[0.025]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[900px] w-[900px] rounded-full bg-gradient-to-r from-white/5 via-white/5 to-white/5 blur-[200px]" />
      </div>
      <div className="relative mx-auto mb-4 flex max-w-7xl flex-col">
        <Navbar />
        <Hero />
        <HeroImage />
      </div>
    </div>
  );
}
