import { useEffect, useState } from "react";

interface PrizeParticipationModalProps {
  prize: {
    name: string;
    totalPrize: string;
    currency: string;
    userTickets: number;
    winChance: string;
    nextDraw: string;
  };
  onClose: () => void;
}

export default function PrizeParticipationModal({ prize, onClose }: PrizeParticipationModalProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const drawTime = new Date(prize.nextDraw).getTime();
      const difference = drawTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [prize.nextDraw]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1a0a2e] to-[#0a0118] rounded-2xl border border-purple-500/30 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg flex items-center justify-center transition-all hover:scale-110 z-10"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50 animate-pulse">
              <i className="ri-ticket-fill text-white text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Prize Participation Details
            </h2>
            <p className="text-gray-400">{prize.name}</p>
          </div>

          {/* Prize Pool Info */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Total Prize Pool</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {prize.totalPrize}
                </span>
                <span className="text-2xl font-bold text-purple-400">{prize.currency}</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-[#0a0118]/60 border border-purple-500/20 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold text-sm mb-4 text-center">Next Draw In</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 mb-2">
                    <div className="text-3xl font-bold text-white">{String(item.value).padStart(2, "0")}</div>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* User Participation Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 flex items-center justify-center bg-purple-500/20 rounded-lg">
                  <i className="ri-ticket-2-line text-purple-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Your Tickets</div>
                  <div className="text-2xl font-bold text-white">{prize.userTickets.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-lg">
                  <i className="ri-percent-line text-green-400 text-xl"></i>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Win Chance</div>
                  <div className="text-2xl font-bold text-green-400">{prize.winChance}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Prize Distribution */}
          <div className="bg-[#0a0118]/60 border border-purple-500/20 rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <i className="ri-trophy-line text-yellow-400"></i>
              Prize Distribution
            </h3>
            <div className="space-y-2">
              {[
                { place: "1st Place", percentage: "50%", color: "from-yellow-400 to-orange-400" },
                { place: "2nd Place", percentage: "25%", color: "from-gray-300 to-gray-400" },
                { place: "3rd Place", percentage: "10%", color: "from-orange-400 to-orange-500" },
                { place: "4th-10th", percentage: "15%", color: "from-purple-400 to-pink-400" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{item.place}</span>
                  <span className={`font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.percentage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Message */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-green-500/20 rounded-full">
                <i className="ri-shield-check-line text-green-400 text-base"></i>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">100% Safe & Transparent</h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Your participation is automatically managed through your vault deposits. Withdraw Anytime, No
                  Principal Loss Guaranteed.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
