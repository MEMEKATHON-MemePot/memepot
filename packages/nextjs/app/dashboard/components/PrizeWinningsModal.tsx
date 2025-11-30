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

  const handleClaim = () => {
    if (onClaim) {
      onClaim();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-[#1a0a2e] to-[#0a0118] rounded-2xl border border-purple-500/30 shadow-2xl"
      >
        {/* Confetti Effect */}
        {winnings.status === "pending" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.7 + 0.3,
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg flex items-center justify-center transition-all hover:scale-110 z-10 cursor-pointer"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Content */}
        <div className="p-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 bg-gradient-to-br ${winnings.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50 ${winnings.status === "pending" ? "animate-pulse" : ""}`}
            >
              <i className="ri-trophy-fill text-white text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-gray-400">You won a prize!</p>
          </div>

          {/* Prize Info */}
          <div
            className={`bg-gradient-to-br ${winnings.gradient}/10 rounded-xl border ${winnings.gradient.replace("from-", "border-").replace(" to-", "/30 border-")} p-6 mb-6`}
          >
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">{winnings.poolName}</p>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {winnings.amount}
                </span>
                <span className="text-3xl font-bold text-purple-400">{winnings.currency}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                <i className="ri-medal-fill text-yellow-400"></i>
                <span className="text-yellow-400 font-bold">{winnings.place}</span>
              </div>
            </div>
          </div>

          {/* Prize Details */}
          <div className="bg-[#0a0118]/60 rounded-xl border border-purple-500/20 p-6 mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="ri-information-line text-purple-400"></i>
              Prize Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Prize Pool</span>
                <span className="text-white font-semibold">{winnings.poolName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Your Position</span>
                <span className="text-yellow-400 font-semibold">{winnings.place}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Prize Amount</span>
                <span className="text-cyan-400 font-bold">
                  {winnings.amount} {winnings.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    winnings.status === "pending"
                      ? "bg-green-500/20 text-green-400 border border-green-500/40"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                  }`}
                >
                  {winnings.status === "pending" ? "Ready to Claim" : "Claimed"}
                </span>
              </div>
            </div>
          </div>

          {/* Celebration Message */}
          {winnings.status === "pending" && (
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30 p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <i className="ri-sparkling-fill text-yellow-400 text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold text-yellow-400 mb-1">Amazing Win!</h4>
                  <p className="text-sm text-gray-300">
                    Your prize is ready to be claimed. Click the button below to receive your winnings!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer"
            >
              {winnings.status === "pending" ? "Later" : "Close"}
            </button>
            {winnings.status === "pending" && (
              <button
                onClick={handleClaim}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-hand-coin-fill text-xl"></i>
                Claim Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
