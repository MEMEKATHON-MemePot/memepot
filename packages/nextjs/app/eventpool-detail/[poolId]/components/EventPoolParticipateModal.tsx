import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { EventPool } from "~~/app/eventpool/types/EventPool";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

function formatBpsToPercent(bps: bigint | number) {
  const n = Number(bps);
  return (n / 100).toFixed(2);
}

interface ParticipateModalProps {
  eventpool: EventPool;
  onClose: () => void;
}

export default function EventPoolParticipateModal({ eventpool, onClose }: ParticipateModalProps) {
  const [enterPoints, setEnterPoints] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();

  const { data: detailData, refetch: refetchDetail } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getEventPoolDetail",
    args: [BigInt(eventpool.id), address] as const,
  });

  const { writeContractAsync: writeEventPoolManager } = useScaffoldWriteContract("EventPoolManager");

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

  const userInfo = useMemo(() => {
    if (!detailData) return null;
    const [, info] = detailData as any;
    return {
      userTotalPoints: Number(info.userTotalPoints ?? 0n),
      userPoints: Number(info.userPoints ?? 0n),
      totalPoints: Number(info.totalPoints ?? 0n),
      winRateBps: Number(info.winRateBps ?? 0n),
    };
  }, [detailData]);

  const expectedWinChance = useMemo(() => {
    if (!userInfo) return null;

    const currentUserPoints = BigInt(userInfo.userPoints);
    const currentTotalPoints = BigInt(userInfo.totalPoints);
    const extra = BigInt(Number(enterPoints) || 0);

    if (extra <= 0n) return null;

    const newUserPoints = currentUserPoints + extra;
    const newTotalPoints = currentTotalPoints + extra;
    if (newTotalPoints === 0n) return null;

    const winBps = (newUserPoints * 10_000n) / newTotalPoints;
    return formatBpsToPercent(winBps);
  }, [userInfo, enterPoints]);

  const handleMaxClick = () => {
    if (userInfo) {
      setEnterPoints(String(userInfo.userTotalPoints));
    }
  };

  const handleConfirm = async () => {
    if (!address || !eventpool.id) return;
    const pts = Number(enterPoints);
    if (!pts || pts <= 0) {
      setError("Please enter a valid number of points");
      return;
    }

    try {
      setError(null);
      const txHash = await writeEventPoolManager({
        functionName: "enterEventPool",
        args: [BigInt(eventpool.id), BigInt(pts)] as const,
      });

      console.log("✅ enterEventPool tx hash:", txHash);
      await refetchDetail();
      onClose();
    } catch (e) {
      console.error("❌ enterEventPool error", e);
      setError("Transaction failed. Please try again.");
    }
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
            <div
              className={`w-20 h-20 bg-gradient-to-br ${eventpool.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50 animate-pulse`}
            >
              <i className="ri-ticket-fill text-white text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Participate in Prize Pool
            </h2>
            <p className="text-gray-400">{eventpool.name}</p>
          </div>
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {/* Prize Info */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Total Prize Pool</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {eventpool.totalPrize}
                </span>
                <span className="text-2xl font-bold text-purple-400">{eventpool.currency}</span>
              </div>
            </div>
          </div>
          {/* Points Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">Number of Points to Use</label>
            <div className="relative">
              <input
                type="number"
                value={enterPoints}
                onChange={e => setEnterPoints(e.target.value)}
                className="w-full bg-[#0a0118]/60 border border-purple-500/30 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-purple-500/60 transition-all"
                placeholder="0"
                min="0"
                max={userInfo?.userTotalPoints ?? 0}
              />
              <button
                onClick={handleMaxClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
              >
                MAX
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-gray-400">Available Points</span>
              <span className="text-white font-semibold">{userInfo?.userTotalPoints ?? 0}</span>
            </div>
          </div>
          {/* Win Chance Simulation */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0a0118]/60 rounded-xl border border-purple-500/20 p-4">
              <p className="text-xs text-gray-400 mb-2">Current Win Chance</p>
              <p className="text-2xl font-bold text-gray-300">{formatBpsToPercent(userInfo?.winRateBps ?? 0)}%</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/40 p-4">
              <p className="text-xs text-gray-400 mb-2">New Win Chance</p>
              <p className="text-2xl font-bold text-green-400">{expectedWinChance ? `${expectedWinChance}%` : "-"}</p>
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
              onClick={handleConfirm}
              disabled={!address || !userInfo || Number(enterPoints) <= 0}
              className={`flex-1 py-3 bg-gradient-to-r ${eventpool.gradient} hover:opacity-90 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              <i className="ri-check-line text-xl"></i>
              Confirm Participation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
