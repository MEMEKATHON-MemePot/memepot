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

  const isConfirmDisabled =
    (activeTab === "add" && (!amount || parseFloat(amount) <= 0)) || (activeTab === "remove" && removePercentage <= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-br from-[#1a0a2e] to-[#0a0118] rounded-2xl border border-purple-500/30 shadow-2xl"
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
            <div
              className={`w-14 h-14 bg-gradient-to-br ${vault.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}
            >
              <i className={`${vault.icon} text-white text-2xl`}></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Manage Vault</h2>
            <p className="text-gray-400 text-sm">{vault.name}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-[#0a0118] p-1 rounded-xl border border-purple-500/20">
            <button
              onClick={() => setActiveTab("add")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "add"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <i className="ri-add-line mr-1"></i>
              Deposit
            </button>
            <button
              onClick={() => setActiveTab("remove")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "remove"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <i className="ri-subtract-line mr-1"></i>
              Withdraw
            </button>
          </div>

          {/* Add Deposit Tab */}
          {activeTab === "add" && (
            <div className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-[#0a0118] border border-purple-500/20 rounded-xl px-4 py-3.5 pr-28 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="0.00"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={handleMaxClick}
                      className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-xs font-semibold text-purple-400 transition-all cursor-pointer"
                    >
                      MAX
                    </button>
                    <span className="text-gray-400 text-sm font-medium">{vault.token}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500">Available</span>
                  <span className="text-gray-400">1,000.00 {vault.token}</span>
                </div>
              </div>

              {/* APY Info */}
              <div className="bg-[#0a0118] rounded-xl border border-purple-500/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-pie-chart-fill text-purple-400"></i>
                  <span className="text-sm font-semibold text-white">APY Breakdown</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Fixed APY</span>
                    <span className="text-green-400 font-semibold">{vault.apy}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Ticket Rate</span>
                    <span className="text-cyan-400 font-semibold">{vault.ticketRate}x</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remove Tab */}
          {activeTab === "remove" && (
            <div className="space-y-4">
              {/* Percentage Buttons */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Withdraw Amount</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[25, 50, 75, 100].map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => handlePercentageClick(percentage)}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        removePercentage === percentage
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "bg-[#0a0118] border border-purple-500/20 text-gray-300 hover:border-purple-500/40"
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
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(219, 39, 119) ${removePercentage}%, rgba(10, 1, 24, 0.8) ${removePercentage}%, rgba(10, 1, 24, 0.8) 100%)`,
                  }}
                />
              </div>

              {/* Summary */}
              <div className="bg-[#0a0118] rounded-xl border border-purple-500/20 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Current Balance</span>
                    <span className="text-white font-medium">
                      {vault.balance.toFixed(2)} {vault.token}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Withdraw</span>
                    <span className="text-cyan-400 font-medium">
                      {calculateRemoveAmount()} {vault.token}
                    </span>
                  </div>
                  <div className="h-px bg-purple-500/20"></div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Remaining</span>
                    <span className="text-white font-medium">
                      {(vault.balance - parseFloat(calculateRemoveAmount())).toFixed(2)} {vault.token}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 rounded-xl font-semibold transition-all cursor-pointer text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className={`flex-1 py-3 bg-gradient-to-r ${vault.gradient} rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                isConfirmDisabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"
              }`}
            >
              <i className="ri-check-line"></i>
              {activeTab === "add" ? "Deposit" : "Withdraw"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
