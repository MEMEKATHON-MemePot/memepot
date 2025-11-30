export default function HeroSection() {
  return (
    <section className="relative z-10 pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3">Your MemePot Summary</h1>
            <p className="text-gray-400 text-lg">Review Your Assets and Rewards. Control Your Fortune.</p>
          </div>

          {/* Wallet Info */}
          <div className="flex items-center gap-4">
            <div className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <i className="ri-user-line text-white text-lg"></i>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Connected Wallet</div>
                  <div className="text-white font-semibold text-sm">0xB884...496a</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
