import { useEffect, useRef, useState } from "react";

interface VaultManageModalProps {
  vault: {
    name: string;
    token: string;
    icon: string;
    gradient: string;
    balance: number;
    apy: number;
    ticketRate: number;
  };
  onClose: () => void;
  onTransaction?: (action: "add" | "withdraw", amount: number, percentage?: number) => void;
}

export default function VaultManageModal({ vault, onClose, onTransaction }: VaultManageModalProps) {
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState("");
  const [removePercentage, setRemovePercentage] = useState(0);
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

  const handleMaxClick = () => {
    if (activeTab === "add") {
      setAmount("1000.00");
    } else {
      setRemovePercentage(100);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    setRemovePercentage(percentage);
  };

  const handleConfirm = () => {
    if (onTransaction) {
      if (activeTab === "add") {
        const depositAmount = parseFloat(amount) || 0;
        onTransaction("add", depositAmount);
      } else {
        onTransaction("withdraw", 0, removePercentage);
      }
    }
    onClose();
  };

  const calculateRemoveAmount = () => {
    return ((vault.balance * removePercentage) / 100).toFixed(2);
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
          className="absolute top-4 right-4 w-10 h-10 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg flex items-center justify-center transition-all hover:scale-110 z-10 cursor-pointer"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 bg-gradient-to-br ${vault.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50`}
            >
              <i className={`${vault.icon} text-white text-4xl`}></i>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Manage Vault
            </h2>
            <p className="text-gray-400">{vault.name}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-[#0a0118]/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("add")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "add"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Add Deposit
            </button>
            <button
              onClick={() => setActiveTab("remove")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "remove"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Withdraw
            </button>
          </div>

          {/* Add Deposit Tab */}
          {activeTab === "add" && (
            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Amount to Deposit</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-[#0a0118]/60 border border-purple-500/30 rounded-xl px-4 py-4 pr-32 text-white text-lg focus:outline-none focus:border-purple-500/60 transition-all"
                    placeholder="0.00"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={handleMaxClick}
                      className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer"
                    >
                      MAX
                    </button>
                    <span className="text-white font-semibold shrink-0">{vault.token}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-gray-400">Available Balance</span>
                  <span className="text-white font-semibold">1,000.00 {vault.token}</span>
                </div>
              </div>

              {/* APY Breakdown */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="ri-pie-chart-fill text-purple-400"></i>
                  APY Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Fixed APY</span>
                    <span className="text-green-400 font-bold">{vault.apy}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Ticket Contribution</span>
                    <span className="text-cyan-400 font-bold">{vault.ticketRate}x</span>
                  </div>
                </div>
              </div>

              {/* Safety Message */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-shield-check-fill text-green-400 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-400 mb-1">100% Safe &amp; Secure</h4>
                    <p className="text-sm text-gray-300">
                      Withdraw Anytime, No Principal Loss Guaranteed. Your deposits are always safe and accessible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remove Deposit Tab */}
          {activeTab === "remove" && (
            <div className="space-y-6">
              {/* Percentage Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Select Withdrawal Amount</label>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[25, 50, 75, 100].map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => handlePercentageClick(percentage)}
                      className={`py-3 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        removePercentage === percentage
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "bg-[#0a0118]/60 border border-purple-500/30 text-gray-300 hover:border-purple-500/60"
                      }`}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={removePercentage}
                  onChange={e => setRemovePercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#0a0118]/60 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(219, 39, 119) ${removePercentage}%, rgba(10, 1, 24, 0.6) ${removePercentage}%, rgba(10, 1, 24, 0.6) 100%)`,
                  }}
                />
              </div>

              {/* Withdrawal Summary */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 p-6">
                <h3 className="text-lg font-bold mb-4">Withdrawal Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Current Balance</span>
                    <span className="text-white font-bold">
                      {vault.balance.toFixed(2)} {vault.token}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Withdrawal Amount</span>
                    <span className="text-cyan-400 font-bold">
                      {calculateRemoveAmount()} {vault.token}
                    </span>
                  </div>
                  <div className="h-px bg-purple-500/30"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Remaining Balance</span>
                    <span className="text-white font-bold">
                      {(vault.balance - parseFloat(calculateRemoveAmount())).toFixed(2)} {vault.token}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety Message */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-shield-check-fill text-green-400 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-400 mb-1">Withdraw Anytime</h4>
                    <p className="text-sm text-gray-300">
                      No Principal Loss Guaranteed. Your deposits are always safe and accessible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 py-3 bg-gradient-to-r ${vault.gradient} hover:opacity-90 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer`}
            >
              <i className="ri-check-line text-xl"></i>
              {activeTab === "add" ? "Confirm Deposit" : "Confirm Withdrawal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
