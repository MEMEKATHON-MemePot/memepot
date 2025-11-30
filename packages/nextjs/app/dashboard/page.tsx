"use client";

import HeroSection from "./components/HeroSection";
import MyVaultsSection from "./components/MyVaultsSection";
import PrizeStatusSection from "./components/PrizeStatusSection";
import SummarySection from "./components/SummarySection";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0118] via-[#1a0b2e] to-[#0a0118] relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <HeroSection />
      <SummarySection />
      <MyVaultsSection />
      <PrizeStatusSection />
    </div>
  );
}
