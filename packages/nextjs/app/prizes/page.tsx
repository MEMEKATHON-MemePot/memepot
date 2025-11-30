"use client";

import HeroSection from "./components/HeroSection";
import PrizePoolsSection from "./components/PrizePoolsSection";

export default function Prizes() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Stars Background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          ></div>
        ))}
      </div>

      <main className="relative z-10">
        <HeroSection />
        <PrizePoolsSection />
      </main>
    </div>
  );
}
