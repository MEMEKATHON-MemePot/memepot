"use client";

import PrizePoolsSection from "./components/EventPoolSection";
import HeroSection from "./components/TitleSection";
import CosmicBackground from "~~/components/CosmicBackground";
import StarsBackground from "~~/components/StarsBackground";

export default function EventPoolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white relative overflow-hidden">
      <CosmicBackground />
      <StarsBackground />

      <main className="relative z-10">
        <HeroSection />
        <PrizePoolsSection />
      </main>
    </div>
  );
}
