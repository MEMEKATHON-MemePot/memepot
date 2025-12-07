"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

const STAKING_MANAGER_ADDRESS = "0x9FA6Be38a26921715996B48C32E42D19DaC366B6" as const;
const STAKING_MANAGER_ABI = deployedContracts[43522].StakingManager.abi;

function formatAmount(raw: bigint, decimals: number) {
  const s = raw.toString().padStart(decimals + 1, "0");
  const intPart = s.slice(0, -decimals);
  const fracPart = s.slice(-decimals).replace(/0+$/, "");
  return fracPart ? `${intPart}.${fracPart}` : intPart;
}

function UserBalance({ tokenAddress, decimals }: { tokenAddress: `0x${string}`; decimals: number }) {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: STAKING_MANAGER_ADDRESS,
    abi: STAKING_MANAGER_ABI,
    functionName: "getUserStakingBalance",
    args: [address ?? "0x0000000000000000000000000000000000000000", tokenAddress],
    query: { enabled: !!address },
  });

  if (!address) return <div>Connect wallet to see your staking balance</div>;
  if (isLoading) return <div>Loading my stake...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error instanceof Error ? error.message : String(error)}</div>;

  const amount = (data ?? 0n) as bigint;

  return <div>My staked: {formatAmount(amount, decimals)}</div>;
}

function PoolActions({
  pool,
}: {
  pool: {
    tokenContract: string;
    decimals: bigint;
    isNative: boolean;
    token: string;
  };
}) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState("0");

  if (!address) return null;

  const decimals = Number(pool.decimals);
  const tokenAddress = pool.tokenContract as `0x${string}`;

  const handleDepositErc20 = async () => {
    const amountRaw = parseUnits(amount, decimals);
    const erc20Abi = deployedContracts[43522].USDT.abi; // USDT/USDC 둘 다 MockERC20 ABI라면 아무거나 사용
    // approve
    await writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [STAKING_MANAGER_ADDRESS, amountRaw],
    });
    // deposit
    await writeContractAsync({
      address: STAKING_MANAGER_ADDRESS,
      abi: STAKING_MANAGER_ABI,
      functionName: "deposit",
      args: [tokenAddress, amountRaw],
    });
  };

  const handleDepositNative = async () => {
    const amountRaw = parseUnits(amount, decimals);
    await writeContractAsync({
      address: STAKING_MANAGER_ADDRESS,
      abi: STAKING_MANAGER_ABI,
      functionName: "depositNative",
      value: amountRaw,
    });
  };

  const handleUnstake = async () => {
    // 예: 100 = 100% 언스테이크라고 가정
    await writeContractAsync({
      address: STAKING_MANAGER_ADDRESS,
      abi: STAKING_MANAGER_ABI,
      functionName: "unstake",
      args: [tokenAddress, BigInt(100)],
    });
  };

  return (
    <div style={{ marginTop: 8 }}>
      <input
        className="bg-black border border-gray-600 px-2 py-1 mr-2"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount"
      />
      {!pool.isNative ? (
        <button className="border px-2 py-1 mr-2" onClick={handleDepositErc20}>
          Deposit {pool.token}
        </button>
      ) : (
        <button className="border px-2 py-1 mr-2" onClick={handleDepositNative}>
          Deposit Native {pool.token}
        </button>
      )}
      <button className="border px-2 py-1" onClick={handleUnstake}>
        Unstake 100%
      </button>
    </div>
  );
}

export default function StakingTestPage() {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: STAKING_MANAGER_ADDRESS,
    abi: STAKING_MANAGER_ABI,
    functionName: "getAllStakingPoolInfos",
  });

  const pools = (data ?? []) as any[];

  return (
    <div className="z-100 bg-black text-white" style={{ padding: 24 }}>
      <h1>Staking Pools (Insectarium)</h1>

      {error && <p style={{ color: "red" }}>Error: {error instanceof Error ? error.message : String(error)}</p>}

      {isLoading && <p>Loading...</p>}

      {!isLoading && pools.length > 0 && (
        <ul>
          {pools.map((pool, idx) => (
            <li key={idx} style={{ marginBottom: 16, borderBottom: "1px solid #444", paddingBottom: 8 }}>
              <div>id: {pool.id.toString()}</div>
              <div>name: {pool.name}</div>
              <div>token: {pool.token}</div>
              <div>tokenContract: {pool.tokenContract}</div>
              <div>apr: {pool.apr.toString()}%</div>
              <div>totalDeposits: {formatAmount(pool.totalDeposits, Number(pool.decimals))}</div>
              <div>volume24h: {formatAmount(pool.volume24h, Number(pool.decimals))}</div>
              <div>decimals: {pool.decimals}</div>
              <div>isNative: {pool.isNative ? "yes" : "no"}</div>
              <UserBalance tokenAddress={pool.tokenContract as `0x${string}`} decimals={Number(pool.decimals)} />
              <PoolActions pool={pool} />
            </li>
          ))}
        </ul>
      )}

      {!isLoading && pools.length === 0 && <p>No pools found</p>}

      <div style={{ marginTop: 24 }}>
        <div>Connected wallet: {address ?? "not connected"}</div>
      </div>
    </div>
  );
}
