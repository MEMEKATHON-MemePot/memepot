export default function SummarySection() {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Staked Assets */}
        <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 hover:border-purple-500/50 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-300 text-base font-semibold">Total Staked Assets</h3>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <i className="ri-safe-fill text-purple-400 text-2xl"></i>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl font-bold text-white">$2,445.67</span>
            <span className="text-sm text-green-400 flex items-center gap-1">
              <i className="ri-arrow-up-line"></i>
              +12.5%
            </span>
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-coin-fill text-green-400 text-sm"></i>
                </div>
                <span className="text-gray-300 font-medium">USDT</span>
              </div>
              <span className="text-white font-semibold text-base">$1,200.00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-coin-line text-blue-400 text-sm"></i>
                </div>
                <span className="text-gray-300 font-medium">USDC</span>
              </div>
              <span className="text-white font-semibold text-base">$800.50</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-coin-fill text-purple-400 text-sm"></i>
                </div>
                <span className="text-gray-300 font-medium">WETH</span>
              </div>
              <span className="text-white font-semibold text-base">$445.17</span>
            </div>
          </div>
        </div>

        {/* Unclaimed Rewards */}
        <div className="bg-gradient-to-br from-pink-900/40 via-pink-800/30 to-pink-900/40 backdrop-blur-sm rounded-2xl border border-pink-500/30 p-8 hover:border-pink-500/50 transition-all shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-300 text-base font-semibold">Unclaimed Rewards</h3>
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <i className="ri-gift-fill text-pink-400 text-2xl"></i>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-pink-400">$156.89</span>
          </div>
          <p className="text-sm text-gray-400 mb-8">APY Returns + Prizes</p>

          {/* Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-percent-line text-cyan-400 text-sm"></i>
                </div>
                <span className="text-gray-300 font-medium">Fixed APY Returns</span>
              </div>
              <span className="text-white font-semibold text-base">$122.34</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-trophy-line text-yellow-400 text-sm"></i>
                </div>
                <span className="text-gray-300 font-medium">Prize Winnings</span>
              </div>
              <span className="text-white font-semibold text-base">$34.55</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center shrink-0">
                  <i className="ri-gift-2-line text-pink-400 text-sm"></i>
                </div>
                <span className="text-gray-300 font-medium">Bonus Rewards</span>
              </div>
              <span className="text-white font-semibold text-base">$0.00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
