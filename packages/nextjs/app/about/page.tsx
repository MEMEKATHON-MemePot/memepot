"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function MemePotLanding() {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[data-section-index]");
      let current = 0;

      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;
        if (window.scrollY >= sectionTop - sectionHeight / 3) {
          current = parseInt(section.getAttribute("data-section-index") || "0");
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    const section = document.querySelector(`section[data-section-index="${index}"]`);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-black text-white overflow-x-hidden scroll-smooth snap-y snap-mandatory">
      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50">
        {[0, 1, 2, 3, 4].map(index => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full my-4 cursor-pointer transition-all duration-300 ${
              activeSection === index ? "bg-[#AD47FF] scale-125" : "bg-white/30"
            }`}
            onClick={() => scrollToSection(index)}
          />
        ))}
      </div>

      {/* Project Introduction Section */}
      <section
        data-section-index="0"
        className="min-h-[90vh] snap-start flex items-center justify-start relative py-0 pt-30 px-10 bg-gradient-to-b from-[#1a0a2e] to-[#0a0514] flex-col max-md:px-5 max-md:py-15"
      >
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-15 items-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-8xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent max-md:text-3xl">
              MemePot
            </h2>

            <h2 className="text-4xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-4 max-md:text-3xl">
              : Creating a New DeFi Culture
            </h2>

            <p className="text-2xl text-gray-400 max-w-3xl max-md:text-lg">
              A DeFi project where trust, safety, and fun coexist
            </p>
          </div>

          <div className="animate-float relative w-full h-[400px] rounded-2xl overflow-hidden border border-purple-400/20 shadow-[0_0_30px_rgba(167,139,250,0.2)] max-md:h-[400px]">
            <Image src="/main_poster.png" alt="MemePot Project Introduction" fill className="object-cover" priority />
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-15 h-15 animate-bounce">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path
              d="M30 15L30 45M30 45L18 33M30 45L42 33"
              stroke="#a78bfa"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section
        data-section-index="1"
        className="min-h-screen snap-start flex items-center justify-center relative py-20 px-10 bg-gradient-to-b from-[#0a0514] to-[#1a0a2e] flex-col text-center max-md:px-5 max-md:py-15"
      >
        <h2 className="text-8xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-15 max-md:text-4xl">
          Mission
        </h2>
        <div className="max-w-4xl text-4xl leading-relaxed text-gray-400 max-md:text-lg">
          <p className="mb-1">MemePot goes beyond simple DeFi</p>
          <p className="mb-1">inheriting the values of the Memecoin Foundation</p>
          <p className="mb-1">to establish itself as part of a broader culture</p>
        </div>
      </section>

      {/* Core Values Section */}
      <section
        data-section-index="2"
        className="min-h-screen snap-start flex items-center justify-center relative py-20 px-10 bg-gradient-to-b from-[#1a0a2e] to-[#0f0820] flex-col max-md:px-5 max-md:py-15"
      >
        <h2 className="text-8xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent text-center mb-20 max-md:text-4xl max-md:mb-12">
          Core Values
        </h2>
        <div className="max-w-6xl w-full">
          {/* Value 1: Trust */}
          <div className="grid grid-cols-2 gap-12 mb-16 items-center max-md:grid-cols-1 max-md:gap-8 max-md:mb-12">
            <div className="flex flex-col gap-4">
              <div className="text-6xl font-bold text-purple-400/30 leading-none max-md:text-4xl">01</div>
              <div className="text-5xl font-bold max-md:text-3xl">Trust</div>
              <div className="text-lg text-gray-400 leading-relaxed max-md:text-base">
                DeFi projects must operate based on trust. That&apos;s why we&apos;re building long-term rewards and
                trust with well-established, transparent strategies rather than engagement-centric ones.
              </div>
            </div>
            <div className="w-full h-80 flex items-center justify-center max-md:h-64">
              <Image src="/trust.png" alt="MemePot Logo" width={80} height={80} className="w-80 h-80" />
            </div>
          </div>

          {/* Value 2: Safety */}
          <div className="grid grid-cols-2 gap-12 mb-16 items-center max-md:grid-cols-1 max-md:gap-8 max-md:mb-12 md:[direction:rtl] [&>*]:md:[direction:ltr]">
            <div className="flex flex-col gap-4">
              <div className="text-6xl font-bold text-purple-400/30 leading-none max-md:text-4xl">02</div>
              <div className="text-5xl font-bold max-md:text-3xl">Safety</div>
              <div className="text-lg text-gray-400 leading-relaxed max-md:text-base">
                We believe technology cannot fix DeFi projects. It requires the security trusted such as Liquidity.
                That&apos;s why we consider security as our foremost goal.
              </div>
            </div>
            <div className="w-full h-80 flex items-center justify-center max-md:h-64">
              <Image src="/safety.png" alt="MemePot Logo" width={80} height={80} className="w-60 h-60" />
            </div>
          </div>

          {/* Value 3: Fun */}
          <div className="grid grid-cols-2 gap-12 mb-16 items-center max-md:grid-cols-1 max-md:gap-8 max-md:mb-12">
            <div className="flex flex-col gap-4">
              <div className="text-6xl font-bold text-purple-400/30 leading-none max-md:text-4xl">03</div>
              <div className="text-5xl font-bold max-md:text-3xl">Fun</div>
              <div className="text-lg text-gray-400 leading-relaxed max-md:text-base">
                With every project launch, 20% takes a year, we build it to provide the fun and excitement of continuous
                events.
              </div>
            </div>
            <div className="w-full h-80 flex items-center justify-center max-md:h-64 animate-float">
              <Image src="/fun.png" alt="MemePot Logo" width={80} height={80} className="w-80 h-80" />
            </div>
          </div>

          {/* Value 4: MemePot */}
          <div className="grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:gap-8 md:[direction:rtl] [&>*]:md:[direction:ltr]">
            <div className="flex flex-col gap-4">
              <div className="text-6xl font-bold text-purple-400/30 leading-none max-md:text-4xl">04</div>
              <div className="text-5xl font-bold max-md:text-3xl">MemePot</div>
              <div className="text-lg text-gray-400 leading-relaxed max-md:text-base">
                We consider trust and safety as our goal, and haven&apos;t and aim to proceed our elements as well.
                MemePot is not just right. So it reflects the values of the Memecoin Foundation by establish itself as
                part of a broader culture.
              </div>
            </div>
            <div className="w-full h-80 flex items-center justify-center max-md:h-64 animate-float">
              <Image src="/memepot_logo.png" alt="MemePot Logo" width={80} height={80} className="w-80 h-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section
        data-section-index="3"
        className="min-h-screen snap-start flex items-center justify-center relative py-30 px-10 bg-gradient-to-b from-[#0f0820] to-[#1a0a2e] flex-col max-md:px-5 max-md:py-15"
      >
        <h2 className="text-8xl font-bold text-center mb-2 max-md:text-4xl">Roadmap</h2>
        <p className="text-center text-gray-400 text-4xl mb-25 max-md:text-base">
          Building the future of DeFi together
        </p>
        <div className="max-w-3xl w-full relative py-5">
          <div className="absolute left-0 top-5 bottom-5 w-[3px] bg-purple-400/20" />

          <div className="pl-12 mb-12 relative before:content-[''] before:absolute before:left-[-6px] before:top-2 before:w-[15px] before:h-[15px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_15px_rgba(167,139,250,0.8)]">
            <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-3 max-md:text-xl">
              2026 Q1
            </div>
            <div className="text-lg text-gray-300 max-md:text-base">MemePot Project Launch</div>
          </div>

          <div className="pl-12 mb-12 relative before:content-[''] before:absolute before:left-[-6px] before:top-2 before:w-[15px] before:h-[15px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_15px_rgba(167,139,250,0.8)]">
            <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-3 max-md:text-xl">
              2026 Q2
            </div>
            <div className="text-lg text-gray-300 max-md:text-base">Community Building & Initial Events Start</div>
          </div>

          <div className="pl-12 mb-12 relative before:content-[''] before:absolute before:left-[-6px] before:top-2 before:w-[15px] before:h-[15px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_15px_rgba(167,139,250,0.8)]">
            <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-3 max-md:text-xl">
              2026 Q3
            </div>
            <div className="text-lg text-gray-300 max-md:text-base">Main Pool Dynamics & Security Audit Complete</div>
          </div>

          <div className="pl-12 relative before:content-[''] before:absolute before:left-[-6px] before:top-2 before:w-[15px] before:h-[15px] before:bg-purple-400 before:rounded-full before:shadow-[0_0_15px_rgba(167,139,250,0.8)]">
            <div className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-3 max-md:text-xl">
              2026 Q4
            </div>
            <div className="text-lg text-gray-300 max-md:text-base">Partnership Expansion & Ecosystem Growth</div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section
        data-section-index="4"
        className="min-h-[60vh] snap-start flex items-center justify-center relative py-[150px] px-10 bg-gradient-to-b from-[#1a0a2e] to-[#2d1b4e] flex-col text-center max-md:px-5"
      >
        <h2 className="text-8xl font-bold mb-4 max-md:text-3xl">Building Together</h2>
        <h3 className="text-8xl font-bold bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent mb-2 max-md:text-3xl">
          A Trustworthy and Fun
        </h3>
        <p className="text-8xl font-bold max-md:text-2xl">Future of DeFi</p>
      </section>

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
