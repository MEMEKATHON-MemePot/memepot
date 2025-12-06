import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseUnits } from "viem";
import VaultManageModal from "./VaultManageModal";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAllVaults } from "~~/hooks/useVaultData";

interface Vault {
  name: string;
  token: string;
  icon: string;
  gradient: string;
  balance: number;
  apy: number;
  earned: number;
  status: string;
  ticketRate: number;
  tokenContract: `0x${string}`;
  decimals: number;
  isNative: boolean;
}

export default function MyVaultsSection() {
  const router = useRouter();
  const [showManageModal, setShowManageModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);

  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([
    { id: "1", label: "Approve Token", status: "pending" },
    { id: "2", label: "Send Transaction", status: "pending" },
  ]);

  // Blockchain write hooks
  const { writeContractAsync: writeVault } = useScaffoldWriteContract({ contractName: "VaultManager" });
  const { writeContractAsync: writeUSDT } = useScaffoldWriteContract({ contractName: "USDT" });
  const { writeContractAsync: writeUSDC } = useScaffoldWriteContract({ contractName: "USDC" });

  // Fetch all vaults from contract
  const { vaults: contractVaults, refetch: refetchVaults } = useAllVaults();

  // Convert contract vaults to display format with user balances
  const vaults: Vault[] =
    contractVaults
      ?.map(vault => {
        const iconMap: { [key: string]: string } = {
          USDT: "ri-coin-fill",
          USDC: "ri-coin-line",
          MEME: "ri-coin-fill",
        };

        const gradientMap: { [key: string]: string } = {
          USDT: "from-green-600 to-emerald-600",
          USDC: "from-blue-600 to-cyan-600",
          MEME: "from-purple-600 to-pink-600",
        };

        return {
          name: vault.name,
          token: vault.token,
          icon: iconMap[vault.token] || "ri-coin-fill",
          gradient: gradientMap[vault.token] || "from-gray-600 to-gray-800",
          balance: 0, // Will be fetched individually
          apy: Number(vault.apr) / 100, // Convert from basis points
          earned: 0, // TODO: Calculate from rewards
          status: "Active",
          ticketRate: 1.0,
          tokenContract: vault.tokenContract,
          decimals: vault.decimals,
          isNative: vault.isNative,
        };
      })
      .filter(() => {
        // TODO: Filter only vaults where user has balance
        return true;
      }) || [];

  const handleManageClick = (vault: Vault) => {
    setSelectedVault(vault);
    setShowManageModal(true);
  };

  const handleTransactionStart = async (action: "add" | "withdraw", amount: number, percentage?: number) => {
    if (!selectedVault) {
      console.error("No vault selected");
      return;
    }

    try {
      const vaultId = BigInt(selectedVault.tokenContract); // Use vault ID from contract

      if (action === "add") {
        // Deposit logic
        const depositAmountWei = parseUnits(amount.toString(), selectedVault.decimals);

        if (selectedVault.isNative) {
          // Native token deposit (MEME) - no approval needed
          setTransactionSteps([{ id: "1", label: "Deposit Native Token", status: "processing" }]);
          setShowTransactionModal(true);
          setShowManageModal(false);

          await writeVault({
            functionName: "depositNative",
            value: depositAmountWei,
          });

          setTransactionSteps([{ id: "1", label: "Deposit Native Token", status: "completed" }]);
        } else {
          // ERC20 token deposit (USDT, USDC)
          setTransactionSteps([
            { id: "1", label: "Approve Token", status: "processing" },
            { id: "2", label: "Deposit to Vault", status: "pending" },
          ]);
          setShowTransactionModal(true);
          setShowManageModal(false);

          const writeToken = selectedVault.token === "USDT" ? writeUSDT : writeUSDC;

          // Step 1: Approve
          await writeToken({
            functionName: "approve",
            args: ["0x378891c0455CB7b9348537610Be87f00f15Feb70" as `0x${string}`, depositAmountWei],
          });

          setTransactionSteps([
            { id: "1", label: "Approve Token", status: "completed" },
            { id: "2", label: "Deposit to Vault", status: "processing" },
          ]);

          // Step 2: Deposit
          await writeVault({
            functionName: "deposit",
            args: [vaultId, depositAmountWei],
          });

          setTransactionSteps([
            { id: "1", label: "Approve Token", status: "completed" },
            { id: "2", label: "Deposit to Vault", status: "completed" },
          ]);
        }
      } else {
        // Withdraw logic
        const withdrawPercentage = percentage || 100;
        const withdrawAmountWei = parseUnits(
          ((selectedVault.balance * withdrawPercentage) / 100).toString(),
          selectedVault.decimals,
        );

        setTransactionSteps([{ id: "1", label: "Withdraw from Vault", status: "processing" }]);
        setShowTransactionModal(true);
        setShowManageModal(false);

        await writeVault({
          functionName: "withdraw",
          args: [vaultId, withdrawAmountWei],
        });

        setTransactionSteps([{ id: "1", label: "Withdraw from Vault", status: "completed" }]);
      }

      // Success - wait and close modal, refetch data
      setTimeout(() => {
        setShowTransactionModal(false);
        refetchVaults();
      }, 1500);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionSteps(prev => prev.map(step => ({ ...step, status: "failed" as const })));
    }
  };

  const handleDepositMore = () => {
    router.push("/vaults");
  };

  return (
    <div className="space-y-6 mb-12">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Vaults</h2>
          <button
            onClick={handleDepositMore}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-add-line"></i>
            Deposit More
          </button>
        </div>

        {/* Table */}
        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Vault</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Staked Amount</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">APY</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Earned</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {vaults.map((vault, index) => (
                  <tr key={index} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${vault.gradient} rounded-lg flex items-center justify-center shrink-0`}
                        >
                          <i className={`${vault.icon} text-white text-lg`}></i>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{vault.name}</p>
                          <p className="text-sm text-gray-400">{vault.token}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-white">${vault.balance.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-green-400">{vault.apy}%</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-cyan-400">${vault.earned.toFixed(2)}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                        <i className="ri-checkbox-circle-fill text-xs"></i>
                        {vault.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleManageClick(vault)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-settings-3-line"></i>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showManageModal && selectedVault && (
        <VaultManageModal
          vault={selectedVault}
          onClose={() => setShowManageModal(false)}
          onTransaction={handleTransactionStart}
        />
      )}

      {showTransactionModal && (
        <TransactionProgressModal
          isOpen={showTransactionModal}
          steps={transactionSteps}
          onClose={() => setShowTransactionModal(false)}
        />
      )}
    </div>
  );
}
