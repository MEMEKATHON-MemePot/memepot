import { useRef } from "react";
import { getAddress } from "viem";
import { Address } from "viem";
import { useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useCopyToClipboard, useOutsideClick } from "~~/hooks/scaffold-eth";
import { isENS } from "~~/utils/scaffold-eth/common";

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({ address, ensAvatar, displayName }: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);

  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = () => {
    dropdownRef.current?.removeAttribute("open");
  };

  useOutsideClick(dropdownRef, closeDropdown);

  // Custom Blockscout Explorer URL
  const explorerUrl = `https://insectarium.blockscout.memecore.com/address/${checkSumAddress}`;

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-[#AD47FF]/50 text-white font-medium rounded-lg px-3 py-2.5 shadow-md dropdown-toggle gap-2 transition-all cursor-pointer flex items-center h-[46px]">
          <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
          <span className="ml-1 mr-1 text-sm">
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-5 w-5 text-slate-400" />
        </summary>
        <ul className="dropdown-content menu z-[100] p-2 mt-2 shadow-xl bg-slate-800 border border-slate-700 rounded-lg gap-1 min-w-[200px]">
          {/* Copy Address */}
          <li>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
              onClick={() => copyAddressToClipboard(checkSumAddress)}
            >
              {isAddressCopiedToClipboard ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 text-[#AD47FF]" aria-hidden="true" />
                  <span className="whitespace-nowrap text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="whitespace-nowrap text-sm">Copy Address</span>
                </>
              )}
            </div>
          </li>

          {/* View on Explorer */}
          <li>
            <a
              target="_blank"
              href={explorerUrl}
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              <span className="whitespace-nowrap text-sm">View on Explorer</span>
            </a>
          </li>

          {/* Disconnect */}
          <li>
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer w-full text-left"
              type="button"
              onClick={() => disconnect()}
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span className="text-sm">Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
