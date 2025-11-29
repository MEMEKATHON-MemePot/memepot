"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReadyPage() {
  const router = useRouter();
  const [particles, setParticles] = useState<
    Array<{ id: number; left: number; top: number; delay: number; duration: number }>
  >([]);

  useEffect(() => {
    // 클라이언트에서만 particles 생성
    setParticles(
      [...Array(20)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10,
      })),
    );
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-start justify-end relative overflow-hidden">
      {/* Background Image - Full Screen */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover">
          <source src="/memepot_ready.webm" type="video/webm" />
          <source src="/memepot_ready.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20"></div>
      </div>

      {/* Content - Right Top Area */}
      <div className="relative z-20 w-full md:w-1/2 lg:w-2/5 h-screen flex flex-col items-center justify-center px-8 md:px-12 lg:px-16">
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Headline with Neon Glow */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            <span
              className="inline-block"
              style={{
                textShadow:
                  "0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)",
              }}
            >
              Ready to blow up
            </span>
            <br />
            <span
              className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              style={{
                textShadow: "0 0 30px rgba(168, 85, 247, 0.9)",
              }}
            >
              MemePot?
            </span>
          </h1>

          {/* CTA Button */}
          <button
            onClick={() => router.push("/about")}
            onKeyDown={e => {
              if (e.key === "Enter") {
                router.push("/about");
              }
            }}
            className="animate-pulse group relative px-12 py-5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white text-xl font-bold rounded-full transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 whitespace-nowrap cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center">
              Enter MemePot
              <i className="ri-arrow-right-line ml-3 group-hover:translate-x-1 transition-transform"></i>
            </span>
            {/* Button Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          </button>

          {/* Decorative Elements */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-purple-300/80 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Stake & Earn</span>
            </div>
            <div className="hidden md:block w-1 h-1 bg-purple-400/50 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
              <span>Win Big</span>
            </div>
            <div className="hidden md:block w-1 h-1 bg-purple-400/50 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
              <span>Join Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          ></div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
