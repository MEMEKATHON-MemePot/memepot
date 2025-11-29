"use client";

// @refresh reset
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { RevealBurnerPKModal } from "./RevealBurnerPKModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Balance } from "@scaffold-ui/components";
import { Address } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const { targetNetwork } = useTargetNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#9030e5] to-[#8e2af1] hover:from-[#8B2FE6] hover:to-[#6B1FB3] text-white font-semibold rounded-lg transition-all shadow-lg shadow-[#AD47FF]/30 cursor-pointer flex items-center gap-2"
                  >
                    <i className="ri-wallet-3-line text-lg"></i>
                    <span>Connect Wallet</span>
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <>
                  <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2.5 mr-2">
                    <div className="flex flex-col items-end">
                      <Balance
                        address={account.address as Address}
                        style={{
                          minHeight: "0",
                          height: "auto",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          color: "#ffffff",
                        }}
                      />
                      <span className="text-xs font-medium text-[#AD47FF] mt-0.5">{chain.name}</span>
                    </div>
                  </div>
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                  <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
                  <RevealBurnerPKModal />
                </>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
