export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 px-6 overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0315] via-[#1a0a2e] to-[#0a0315]"></div>

      {/* Animated Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          ></div>
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-[#8F2EE7]/30 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#8F2EE7]/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-[#8F2EE7]/30 rounded-full mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white/80 text-sm font-medium">Connected</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-pink-500 via-[#8F2EE7] to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(143,46,231,0.5)]">
            Your MemePot
          </span>
        </h1>

        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
          Review Your Assets and Rewards. Control Your Fortune.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-[#8F2EE7] rounded-full text-white font-semibold text-lg hover:shadow-[0_0_30px_rgba(143,46,231,0.6)] transition-all whitespace-nowrap">
            <i className="ri-wallet-3-line mr-2"></i>
            0x742d...3a9f
          </button>
          <button className="px-8 py-4 border-2 border-[#8F2EE7] rounded-full text-white font-semibold text-lg hover:bg-[#8F2EE7]/20 hover:shadow-[0_0_30px_rgba(143,46,231,0.4)] transition-all whitespace-nowrap">
            <i className="ri-refresh-line mr-2"></i>
            Refresh Data
          </button>
        </div>
      </div>
    </section>
  );
}
