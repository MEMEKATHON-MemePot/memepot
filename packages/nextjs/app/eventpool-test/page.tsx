"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const FREQUENCY_MAP: Record<number, "1D" | "1W" | "1M"> = {
  0: "1D",
  1: "1W",
  2: "1M",
};

const STATUS_MAP: Record<number, "active" | "completed" | "cancelled"> = {
  0: "active",
  1: "completed",
  2: "cancelled",
};

function formatBpsToPercent(bps: bigint | number) {
  const n = Number(bps);
  return (n / 100).toFixed(2);
}

export default function EventPoolTestPage() {
  const { address } = useAccount();
  const [enterPoints, setEnterPoints] = useState<string>("0");

  // 1) 전체 풀 리스트
  const { data: poolsData } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getAllEventPools",
  });

  // poolsData 가공
  const pools = useMemo(() => {
    if (!poolsData) return [];
    return (poolsData as any[]).map(p => ({
      poolId: Number(p.id),
      poolNum: Number(p.poolNum),
      rewardToken: p.rewardToken as string,
      totalPrizeRaw: p.totalPrize as bigint,
      frequency: FREQUENCY_MAP[Number(p.frequency)] ?? "1D",
      status: STATUS_MAP[Number(p.status)] ?? "active",
      nextDrawAt: Number(p.nextDrawAt),
      totalPoints: Number(p.totalPoints),
    }));
  }, [poolsData]);

  // 2) 첫 풀 기준 내 정보
  const firstPoolId = pools[0]?.poolId;

  const { data: detailData, refetch: refetchDetail } = useScaffoldReadContract({
    contractName: "EventPoolManager",
    functionName: "getEventPoolDetail",
    args: [firstPoolId !== undefined ? BigInt(firstPoolId) : undefined, address ?? undefined] as const,
  });

  // 3) enterEventPool 트랜잭션 훅
  const { writeContractAsync: writeEventPoolManager } = useScaffoldWriteContract("EventPoolManager");

  const handleEnter = async () => {
    if (!address || firstPoolId === undefined) return;
    const pts = Number(enterPoints);
    if (!pts || pts <= 0) return;

    try {
      console.log("▶ enterEventPool tx start", { poolId: firstPoolId, points: pts });

      const txHash = await writeEventPoolManager({
        functionName: "enterEventPool",
        args: [BigInt(firstPoolId), BigInt(pts)] as const,
      });

      console.log("✅ enterEventPool tx hash:", txHash);

      await refetchDetail();
    } catch (e) {
      console.error("❌ enterEventPool error", e);
    }
  };

  // 4) 인풋 기준 예상 winChance 계산
  const expectedWinChance = useMemo(() => {
    if (!detailData) return null;
    const [, userInfo] = detailData as any;

    const currentUserPoints = BigInt(userInfo.userPoints ?? 0n);
    const currentTotalPoints = BigInt(userInfo.totalPoints ?? 0n);
    const extra = BigInt(Number(enterPoints) || 0);

    if (extra <= 0n) return null;

    const newUserPoints = currentUserPoints + extra;
    const newTotalPoints = currentTotalPoints + extra;
    if (newTotalPoints === 0n) return null;

    const winBps = (newUserPoints * 10_000n) / newTotalPoints; // 10000bps = 100%
    return formatBpsToPercent(winBps);
  }, [detailData, enterPoints]);

  if (poolsData && address) {
    console.log("✅ getAllEventPools raw:", poolsData);
    console.log("✅ mapped pools:", pools);
    console.log("✅ connected address:", address);
  }

  if (detailData) {
    const [pool, userInfo] = detailData as any;
    console.log("✅ getEventPoolDetail raw:", detailData);
    console.log("➡ pool:", pool);
    console.log("➡ userInfo:", userInfo);
    console.log("➡ userTotalPoints:", userInfo.userTotalPoints?.toString());
    console.log("➡ userPointsInPool:", userInfo.userPoints?.toString());
    console.log("➡ winRateBps:", userInfo.winRateBps?.toString());
  }

  return (
    <main className="min-h-screen text-white p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">EventPool Test Page</h1>

      <p className="text-sm text-gray-400 mb-4">
        콘솔에서 getAllEventPools / getEventPoolDetail / enterEventPool 흐름을 확인하는 테스트 페이지야.
      </p>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold mb-2">1. Wallet</h2>
          <p>address: {address ?? "지갑 연결 필요"}</p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">2. Pools (from EventPoolManager)</h2>
          <p>count: {pools.length}</p>
          <ul className="text-sm mt-2 space-y-1">
            {pools.map(p => (
              <li key={p.poolId}>
                poolId #{p.poolId} / poolNum #{p.poolNum} / freq {p.frequency} / status {p.status} / totalPoints{" "}
                {p.totalPoints}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold mb-2">3. First pool my info (getEventPoolDetail)</h2>
          {detailData ? (
            (() => {
              const [, userInfo] = detailData as any;
              return (
                <div className="text-sm space-y-1">
                  <p>userTotalPoints: {userInfo.userTotalPoints.toString()}</p>
                  <p>userPointsInPool: {userInfo.userPoints.toString()}</p>
                  <p>winChance (current): {formatBpsToPercent(userInfo.winRateBps)}%</p>
                </div>
              );
            })()
          ) : (
            <p className="text-sm text-gray-500">지갑 연결 후 첫 풀에 대한 상세를 자동 조회할 거야.</p>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2">4. Enter first pool (enterEventPool)</h2>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="number"
              min={0}
              value={enterPoints}
              onChange={e => setEnterPoints(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1 w-32"
              placeholder="points"
            />
            <button
              onClick={handleEnter}
              disabled={!address || firstPoolId === undefined}
              className="px-3 py-1 rounded bg-emerald-600 disabled:bg-gray-600 text-sm"
            >
              Enter first pool
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            points는 이번에 추가로 사용할 포인트 수야. 트랜잭션 후 위의 내 정보가 갱신되는지 확인해 봐.
          </p>
          {expectedWinChance && (
            <p className="text-xs text-emerald-400 mt-1">
              입력한 포인트로 참여하면 예상 당첨 확률: {expectedWinChance}%
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
