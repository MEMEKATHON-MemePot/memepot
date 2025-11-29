export default function CTASection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center space-y-8">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <i className="ri-rocket-2-line text-4xl text-white"></i>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white">Ready to Start Your Journey?</h2>
              <p className="text-cyan-50 text-lg max-w-2xl mx-auto leading-relaxed">
                지금 바로 MEMEPOT에 참여하여 안정적인 수익과 흥미진진한 이벤트를 경험해보세요. 수천 명의 사용자들이 이미
                함께하고 있습니다.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto py-8">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-white">10K+</div>
                <div className="text-cyan-50 text-sm">Active Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-white">$5M+</div>
                <div className="text-cyan-50 text-sm">Total Staked</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-white">98%</div>
                <div className="text-cyan-50 text-sm">Satisfaction</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-4 bg-white hover:bg-slate-100 text-cyan-600 font-bold rounded-lg transition-all shadow-xl whitespace-nowrap cursor-pointer">
                <i className="ri-wallet-3-line mr-2"></i>
                Connect Wallet
              </button>
              <button className="px-8 py-4 bg-transparent hover:bg-white/10 text-white font-bold rounded-lg transition-all border-2 border-white whitespace-nowrap cursor-pointer">
                <i className="ri-book-open-line mr-2"></i>
                Read Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
