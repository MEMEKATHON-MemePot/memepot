import { useEffect, useRef } from "react";

interface PrizeWinningsModalProps {
  winnings: {
    poolName: string;
    amount: string;
    currency: string;
    place: string;
    gradient: string;
    status: "pending" | "claimed";
  };
  onClose: () => void;
  onClaim?: () => void;
}

export default function PrizeWinningsModal({ winnings, onClose, onClaim }: PrizeWinningsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleClaim = () => {
    if (onClaim) {
      onClaim();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-gradient-to-br from-[#1a0a2e] to-[#0a0118] rounded-2xl border border-yellow-500/30 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-purple-500/20 hover:bg-purple-500/40 rounded-xl flex items-center justify-center transition-all hover:scale-110 z-10 cursor-pointer"
        >
          <i className="ri-close-line text-xl text-gray-300"></i>
        </button>

        {/* Content */}
        <div className="p-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${winnings.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
            >
              <i className="ri-trophy-fill text-white text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold mb-1 text-white">Congratulations!</h2>
            <p className="text-gray-400 text-sm">You won a prize</p>
          </div>

          {/* Prize Amount Card */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 p-5 mb-5">
            <p className="text-xs text-gray-400 mb-2 text-center uppercase tracking-wider">{winnings.poolName}</p>
            <div className="flex items-baseline justify-center gap-2 mb-3">
              <span className="text-4xl font-bold text-white">{winnings.amount}</span>
              <span className="text-xl font-semibold text-yellow-400">{winnings.currency}</span>
            </div>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-sm">
                <i className="ri-medal-fill text-yellow-400"></i>
                <span className="text-yellow-400 font-semibold">{winnings.place}</span>
              </span>
            </div>
          </div>

          {/* Prize Details */}
          <div className="bg-[#0a0118] rounded-xl border border-purple-500/20 p-4 mb-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Prize Pool</span>
                <span className="text-white font-medium">{winnings.poolName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Position</span>
                <span className="text-yellow-400 font-medium">{winnings.place}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="text-cyan-400 font-medium">
                  {winnings.amount} {winnings.currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    winnings.status === "pending" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {winnings.status === "pending" ? "Ready to Claim" : "Claimed"}
                </span>
              </div>
            </div>
          </div>

          {/* Info Message */}
          {winnings.status === "pending" && (
            <div className="bg-[#0a0118] rounded-xl border border-green-500/20 p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <i className="ri-sparkling-fill text-green-400"></i>
                </div>
                <p className="text-sm text-gray-300">Your prize is ready! Click below to claim your winnings.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 rounded-xl font-semibold transition-all cursor-pointer text-gray-300"
            >
              {winnings.status === "pending" ? "Later" : "Close"}
            </button>
            {winnings.status === "pending" && (
              <button
                onClick={handleClaim}
                disabled={!winnings.amount || parseFloat(winnings.amount) <= 0}
                className={`flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  !winnings.amount || parseFloat(winnings.amount) <= 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-yellow-400 hover:to-orange-400 cursor-pointer"
                }`}
              >
                <i className="ri-hand-coin-fill"></i>
                Claim Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
