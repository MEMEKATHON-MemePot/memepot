import { useEffect, useState } from "react";
import { EventPool } from "~~/app/eventpool/types/EventPool";

interface PrizeInfoSectionProps {
  eventPool: EventPool;
  onParticipate: () => void;
}

export default function PrizeInfoSection({ eventPool, onParticipate }: PrizeInfoSectionProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = eventPool.nextDraw - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [eventPool.nextDraw]);

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Prize Info */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={`w-20 h-20 bg-gradient-to-br ${eventPool.gradient} rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse shrink-0`}
            >
              <i className={`${eventPool.icon} text-white text-4xl`}></i>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {eventPool.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-full text-sm text-purple-300 font-semibold">
                  {eventPool.frequency}
                </span>
                <span className="px-4 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full text-sm text-green-300 font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  LIVE NOW
                </span>
              </div>
            </div>
          </div>

          {/* Prize Breakdown */}
          <div className="relative bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 flex-1 overflow-hidden">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <i className="ri-trophy-fill text-yellow-400 text-2xl"></i>
                  Prize Breakdown
                </h3>
                <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                  <span className="text-xs text-yellow-300 font-semibold">100% Distributed</span>
                </div>
              </div>

              <div className="space-y-4">
                {eventPool.prizeBreakdown?.map((item, index) => {
                  const trophyColors = [
                    "from-yellow-500 to-amber-500", // 1st - Gold
                    "from-gray-400 to-gray-500", // 2nd - Silver
                    "from-orange-600 to-amber-700", // 3rd - Bronze
                  ];
                  const borderColors = [
                    "border-yellow-500/30 hover:border-yellow-500/60", // 1st
                    "border-gray-400/30 hover:border-gray-400/60", // 2nd
                    "border-orange-600/30 hover:border-orange-600/60", // 3rd
                  ];
                  const bgGlows = [
                    "from-yellow-500/10 to-amber-500/5", // 1st
                    "from-gray-400/10 to-gray-500/5", // 2nd
                    "from-orange-600/10 to-amber-700/5", // 3rd
                  ];

                  const trophyColor = trophyColors[index] || "from-purple-500 to-pink-500";
                  const borderColor = borderColors[index] || "border-purple-500/30 hover:border-purple-500/60";
                  const bgGlow = bgGlows[index] || "from-purple-500/10 to-pink-500/5";

                  return (
                    <div
                      key={index}
                      className={`relative flex items-center justify-between p-5 bg-gradient-to-r ${bgGlow} rounded-xl border ${borderColor} transition-all group overflow-hidden`}
                    >
                      {/* Rank number background */}
                      <div className="absolute top-0 right-0 text-[80px] font-bold text-white/5 leading-none pointer-events-none">
                        {index + 1}
                      </div>

                      <div className="flex items-center gap-4 relative z-10">
                        <div
                          className={`w-14 h-14 bg-gradient-to-br ${trophyColor} rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <i className="ri-trophy-fill text-white text-2xl"></i>
                        </div>
                        <div>
                          <span className="text-white font-bold text-lg block">{item.place}</span>
                          <span className="text-gray-400 text-sm">{item.percentage}% of total</span>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <div className="text-2xl font-bold text-cyan-400">
                          {item.amount} <span className="text-lg text-purple-400">{eventPool.currency}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Prize Pool & Stats */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Total Prize Pool */}
          <div className="relative bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${eventPool.gradient} opacity-10`}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

            <div className="relative text-center">
              <p className="text-gray-400 mb-4 text-lg">Total Prize Pool</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {eventPool.totalPrize}
                </span>
                <span className="text-4xl font-bold text-purple-400">{eventPool.currency}</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Next Draw In:</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-semibold">LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#0a0118]/60 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{timeLeft.days}</div>
                <div className="text-sm text-gray-400">Days</div>
              </div>
              <div className="bg-[#0a0118]/60 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{timeLeft.hours}</div>
                <div className="text-sm text-gray-400">Hours</div>
              </div>
              <div className="bg-[#0a0118]/60 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{timeLeft.minutes}</div>
                <div className="text-sm text-gray-400">Mins</div>
              </div>
              <div className="bg-[#0a0118]/60 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-4xl font-bold text-cyan-400 mb-2 animate-pulse">{timeLeft.seconds}</div>
                <div className="text-sm text-gray-400">Secs</div>
              </div>
            </div>
          </div>

          {/* Participate Button */}
          <button
            onClick={onParticipate}
            className={`w-full py-4 bg-gradient-to-r ${eventPool.gradient} hover:opacity-90 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 flex items-center justify-center gap-3 whitespace-nowrap`}
          >
            <i className="ri-ticket-fill text-2xl"></i>
            Participate Now
            <i className="ri-arrow-right-line text-xl"></i>
          </button>
        </div>
      </div>

      {/* Your Participation Stats - Full Width Below */}
      <div className="mt-8 bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8">
        <h3 className="text-2xl font-bold mb-6 text-center">Your Participation Stats</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Your Tickets */}
          <div className="bg-[#0a0118]/60 rounded-xl border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-ticket-fill text-white text-xl"></i>
              </div>
              <span className="text-sm text-gray-400">Your Tickets</span>
            </div>
            <p className="text-3xl font-bold text-white">{eventPool.userStats?.userPoints?.toLocaleString() ?? 0}</p>
          </div>

          {/* Win Chance */}
          <div className="bg-[#0a0118]/60 rounded-xl border border-green-500/20 p-6 hover:border-green-500/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-percent-line text-white text-xl"></i>
              </div>
              <span className="text-sm text-gray-400">Win Chance</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{eventPool.userStats?.winChance ?? "0.0000"}%</p>
          </div>

          {/* Participants */}
          <div className="bg-[#0a0118]/60 rounded-xl border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-group-fill text-white text-xl"></i>
              </div>
              <span className="text-sm text-gray-400">Participants</span>
            </div>
            <p className="text-3xl font-bold text-white">{eventPool.participants?.toLocaleString() ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Active players</p>
          </div>

          {/* Total Tickets */}
          <div className="bg-[#0a0118]/60 rounded-xl border border-orange-500/20 p-6 hover:border-orange-500/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-stack-fill text-white text-xl"></i>
              </div>
              <span className="text-sm text-gray-400">Total Tickets</span>
            </div>
            <p className="text-3xl font-bold text-white">{eventPool.userStats?.totalTickets?.toLocaleString() ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">In this pool</p>
          </div>
        </div>
      </div>
    </section>
  );
}
