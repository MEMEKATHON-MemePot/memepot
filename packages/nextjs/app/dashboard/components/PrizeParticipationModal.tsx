import { useEffect, useRef, useState } from "react";

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
  const modalRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

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
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1a0a2e] to-[#0a0118] rounded-2xl border border-purple-500/30 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-purple-500/20 hover:bg-purple-500/40 rounded-xl flex items-center justify-center transition-all hover:scale-110 z-10 cursor-pointer"
        >
          <i className="ri-close-line text-xl text-gray-300"></i>
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
              <i className="ri-ticket-fill text-white text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-1 text-white">Prize Pool Details</h2>
            <p className="text-gray-400 text-sm">{prize.name}</p>
          </div>

          {/* Prize Pool Info */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-5 mb-5">
            <p className="text-xs text-gray-400 mb-1 text-center uppercase tracking-wider">Total Prize Pool</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-bold text-white">{prize.totalPrize}</span>
              <span className="text-lg font-semibold text-purple-400">{prize.currency}</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-3 text-center uppercase tracking-wider">Next Draw In</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Min", value: timeLeft.minutes },
                { label: "Sec", value: timeLeft.seconds },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-[#0a0118] border border-purple-500/20 rounded-lg py-3 mb-1">
                    <div className="text-2xl font-bold text-cyan-400 font-mono">
                      {String(item.value).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#0a0118] border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <i className="ri-ticket-2-line text-purple-400"></i>
                </div>
                <span className="text-xs text-gray-400">Your Points</span>
              </div>
              <p className="text-xl font-bold text-white">{prize.userTickets.toLocaleString()}</p>
            </div>
            <div className="bg-[#0a0118] border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <i className="ri-percent-line text-green-400"></i>
                </div>
                <span className="text-xs text-gray-400">Win Chance</span>
              </div>
              <p className="text-xl font-bold text-green-400">{prize.winChance}</p>
            </div>
          </div>

          {/* Prize Distribution */}
          <div className="bg-[#0a0118] border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-trophy-fill text-yellow-400"></i>
              <span className="text-sm font-semibold text-white">Prize Distribution</span>
            </div>
            <div className="space-y-2">
              {[
                { place: "1st", percentage: "60%", color: "text-yellow-400", bg: "bg-yellow-500/10" },
                { place: "2nd", percentage: "30%", color: "text-gray-300", bg: "bg-gray-500/10" },
                { place: "3rd", percentage: "10%", color: "text-orange-400", bg: "bg-orange-500/10" },
              ].map((item, index) => (
                <div key={index} className={`flex items-center justify-between px-3 py-2 ${item.bg} rounded-lg`}>
                  <div className="flex items-center gap-2">
                    <i className={`ri-medal-fill ${item.color}`}></i>
                    <span className="text-gray-300 text-sm">{item.place} Place</span>
                  </div>
                  <span className={`font-bold ${item.color}`}>{item.percentage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
