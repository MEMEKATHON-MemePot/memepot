export default function HeroSection() {
  return (
    <section className="relative px-6 py-20 md:py-32">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">What is MEMEPOT?</h1>
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">Deposit To Win</h2>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Guaranteed Steady Income</h2>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Thrilling MemePot Events</h2>
              </div>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed">
              MEMEPOT은 혁신적인 스테이킹 플랫폼으로, 안정적인 수익과 함께 흥미진진한 이벤트를 제공합니다. 지금 바로
              참여하여 특별한 보상을 받아보세요.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/50 whitespace-nowrap cursor-pointer">
                Get Started
                <i className="ri-arrow-right-line ml-2"></i>
              </button>
              <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all border border-slate-700 whitespace-nowrap cursor-pointer">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Image Area - Placeholder */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-700 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center">
                  <i className="ri-image-line text-4xl text-slate-500"></i>
                </div>
                <p className="text-slate-500 font-medium">Image Area</p>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
