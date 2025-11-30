export default function PrizeStatusSection() {
  const prizeParticipations = [
    {
      pool: "Daily Mega Draw",
      tickets: 24,
      nextDraw: "8h 32m",
      winChance: "0.48%",
      prize: "$5,000",
      status: "Active",
    },
    {
      pool: "Weekly Grand Prize",
      tickets: 18,
      nextDraw: "3d 12h",
      winChance: "0.36%",
      prize: "$50,000",
      status: "Active",
    },
    {
      pool: "Monthly Jackpot",
      tickets: 12,
      nextDraw: "18d 5h",
      winChance: "0.24%",
      prize: "$200,000",
      status: "Active",
    },
  ];

  const winnings = [
    {
      pool: "Daily Mega Draw",
      date: "2024-01-15",
      amount: "$25.50",
      status: "Claimed",
    },
    {
      pool: "Weekly Grand Prize",
      date: "2024-01-10",
      amount: "$9.05",
      status: "Unclaimed",
    },
  ];

  return (
    <section className="relative z-10 px-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Prize Pool Participation */}
        <div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Prize Pool Participation</h2>
            <p className="text-gray-400">Your active entries in ongoing prize draws</p>
          </div>

          <div className="rounded-2xl bg-[#1a0b2e]/60 border border-pink-500/20 backdrop-blur-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-8 py-4 bg-pink-900/20 border-b border-pink-500/20">
              <div className="text-center text-gray-400 text-sm font-semibold">Prize Pool</div>
              <div className="text-center text-gray-400 text-sm font-semibold">Your Tickets</div>
              <div className="text-center text-gray-400 text-sm font-semibold">Next Draw</div>
              <div className="text-center text-gray-400 text-sm font-semibold">Win Chance</div>
              <div className="text-center text-gray-400 text-sm font-semibold">Prize Amount</div>
              <div className="text-center text-gray-400 text-sm font-semibold">Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-pink-500/10">
              {prizeParticipations.map((participation, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 px-8 py-6 hover:bg-pink-500/5 transition-colors">
                  {/* Prize Pool */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white font-semibold">{participation.pool}</div>
                    </div>
                  </div>

                  {/* Your Tickets */}
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                      <span className="text-cyan-400 font-semibold">{participation.tickets}</span>
                    </div>
                  </div>

                  {/* Next Draw */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white font-semibold">{participation.nextDraw}</div>
                    </div>
                  </div>

                  {/* Win Chance */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-purple-400 font-semibold">{participation.winChance}</div>
                    </div>
                  </div>

                  {/* Prize Amount */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-pink-400 font-bold text-lg">{participation.prize}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center">
                    <div className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30">
                      <span className="text-green-400 font-semibold">{participation.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prize Winnings */}
        <div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Prize Winnings</h2>
            <p className="text-gray-400">Your prize history and claimable rewards</p>
          </div>

          <div className="rounded-2xl bg-[#1a0b2e]/60 border border-cyan-500/20 backdrop-blur-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-8 py-4 bg-cyan-900/20 border-b border-cyan-500/20">
              <div className="text-center text-gray-400 text-sm font-semibold">Prize Pool</div>
              <div className="text-center text-gray-400 text-sm font-semibold">Date</div>
              <div className="text-center text-gray-400 text-sm font-semibold">Amount</div>
              <div className="text-center text-gray-400 text-sm font-semibold">Status</div>
              <div className="text-center text-gray-400 text-sm font-semibold">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-cyan-500/10">
              {winnings.map((winning, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 px-8 py-6 hover:bg-cyan-500/5 transition-colors">
                  {/* Prize Pool */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white font-semibold">{winning.pool}</div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-400">{winning.date}</div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-cyan-400 font-bold text-lg">{winning.amount}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center">
                    {winning.status === "Claimed" ? (
                      <div className="px-3 py-1 rounded-lg bg-gray-500/20 border border-gray-500/30">
                        <span className="text-gray-400 font-semibold">{winning.status}</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 rounded-lg bg-pink-500/20 border border-pink-500/30 animate-pulse">
                        <span className="text-pink-400 font-semibold">{winning.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-center">
                    {winning.status === "Unclaimed" ? (
                      <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-pink-600 text-white text-sm font-semibold hover:from-cyan-500 hover:to-pink-500 transition-all hover:shadow-lg hover:shadow-cyan-500/50 whitespace-nowrap cursor-pointer">
                        <i className="ri-hand-coin-line mr-1"></i>
                        Claim
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
