export default function SummarySection() {
  return (
    <section className="relative z-10 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Staked Assets */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-gray-400 text-sm mb-2">Total Staked Assets</div>
                  <div className="text-4xl font-bold text-white mb-1">$2,445.67</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">+12.5%</span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <i className="ri-safe-2-line text-white text-2xl"></i>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">USDT</span>
                  <span className="text-white font-semibold">$1,200.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">USDC</span>
                  <span className="text-white font-semibold">$800.50</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">WETH</span>
                  <span className="text-white font-semibold">$445.17</span>
                </div>
              </div>

              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-500 hover:to-purple-600 transition-all hover:shadow-lg hover:shadow-purple-500/50 whitespace-nowrap cursor-pointer">
                <i className="ri-arrow-down-line mr-2"></i>
                Withdraw
              </button>
            </div>
          </div>

          {/* Unclaimed Rewards */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-pink-900/40 to-pink-800/20 border border-pink-500/30 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-gray-400 text-sm mb-2">Unclaimed Rewards</div>
                  <div className="text-4xl font-bold text-white mb-1">$156.89</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-cyan-400">APY Returns + Prizes</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/50">
                  <i className="ri-gift-line text-white text-2xl"></i>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Fixed APY Returns</span>
                  <span className="text-white font-semibold">$122.34</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Prize Winnings</span>
                  <span className="text-white font-semibold">$34.55</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Bonus Rewards</span>
                  <span className="text-white font-semibold">$0.00</span>
                </div>
              </div>

              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold hover:from-pink-500 hover:to-pink-600 transition-all hover:shadow-lg hover:shadow-pink-500/50 whitespace-nowrap cursor-pointer">
                <i className="ri-hand-coin-line mr-2"></i>
                Claim All
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
