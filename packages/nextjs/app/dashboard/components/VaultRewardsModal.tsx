import { useEffect, useRef } from "react";

interface Reward {
  token: string;
  amount: number;
  icon: string;
  gradient: string;
}

interface VaultRewardsModalProps {
  rewards: Reward[];
  totalValue: number;
  onClose: () => void;
  onClaim?: () => void;
}

export default function VaultRewardsModal({ rewards, totalValue, onClose, onClaim }: VaultRewardsModalProps) {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-[#1a0a2e] to-[#0a0118] rounded-2xl border border-purple-500/30 shadow-2xl"
      >
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
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/50 animate-pulse">
              <i className="ri-gift-fill text-white text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Claim All Rewards
            </h2>
            <p className="text-gray-400">Your unclaimed vault rewards</p>
          </div>

          {/* Total Value */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Total Rewards Value</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ${totalValue.toFixed(2)}
                </span>
                <span className="text-2xl font-bold text-gray-400">USD</span>
              </div>
            </div>
          </div>

          {/* Rewards List */}
          <div className="space-y-3 mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="ri-list-check text-purple-400"></i>
              Claimable Rewards
            </h3>
            {rewards.map((reward, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-[#0a0118]/60 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${reward.gradient} rounded-lg flex items-center justify-center shrink-0`}
                  >
                    <i className={`${reward.icon} text-white text-xl`}></i>
                  </div>
                  <span className="text-white font-semibold">{reward.token}</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-cyan-400">{reward.amount.toFixed(4)}</div>
                  <div className="text-sm text-gray-400">{reward.token}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Message */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-information-line text-purple-400"></i>
              </div>
              <div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  These are your fixed APY rewards from vault deposits. Claim them anytime without affecting your
                  principal balance.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleClaim}
              className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <i className="ri-hand-coin-fill text-xl"></i>
              Claim All Rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
