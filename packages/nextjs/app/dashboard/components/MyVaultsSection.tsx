export default function MyVaultsSection() {
  const vaults = [
    {
      token: "USDT",
      icon: "💵",
      staked: "1,200.00",
      apy: "8.5",
      earned: "81.60",
      status: "Active",
    },
    {
      token: "USDC",
      icon: "💰",
      staked: "800.50",
      apy: "7.2",
      earned: "46.11",
      status: "Active",
    },
    {
      token: "WETH",
      icon: "💎",
      staked: "445.17",
      apy: "12.3",
      earned: "43.87",
      status: "Active",
    },
  ];

  return (
    <section className="relative z-10 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">My Vaults</h2>
          <p className="text-gray-400">Track your deposits and earnings across all vaults</p>
        </div>

        <div className="rounded-2xl bg-[#1a0b2e]/60 border border-purple-500/20 backdrop-blur-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 px-8 py-4 bg-purple-900/20 border-b border-purple-500/20">
            <div className="text-center text-gray-400 text-sm font-semibold">Vault</div>
            <div className="text-center text-gray-400 text-sm font-semibold">Staked Amount</div>
            <div className="text-center text-gray-400 text-sm font-semibold">APY</div>
            <div className="text-center text-gray-400 text-sm font-semibold">Earned</div>
            <div className="text-center text-gray-400 text-sm font-semibold">Status</div>
            <div className="text-center text-gray-400 text-sm font-semibold">Action</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-purple-500/10">
            {vaults.map((vault, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 px-8 py-6 hover:bg-purple-500/5 transition-colors">
                {/* Vault */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                    {vault.icon}
                  </div>
                  <span className="text-white font-semibold">{vault.token}</span>
                </div>

                {/* Staked Amount */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white font-semibold">${vault.staked}</div>
                  </div>
                </div>

                {/* APY */}
                <div className="flex items-center justify-center">
                  <div className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30">
                    <span className="text-green-400 font-semibold">{vault.apy}%</span>
                  </div>
                </div>

                {/* Earned */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-cyan-400 font-semibold">${vault.earned}</div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center">
                  <div className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <span className="text-purple-400 font-semibold">{vault.status}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-center">
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-500 hover:to-pink-500 transition-all hover:shadow-lg hover:shadow-purple-500/50 whitespace-nowrap cursor-pointer">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
