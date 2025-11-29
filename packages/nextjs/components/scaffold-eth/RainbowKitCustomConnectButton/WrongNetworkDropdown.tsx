import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <div className="dropdown dropdown-end mr-2">
      <label
        tabIndex={0}
        className="bg-red-500/20 border border-red-500/50 hover:border-red-500 text-red-400 font-medium rounded-lg px-4 py-2.5 shadow-md dropdown-toggle gap-2 h-auto transition-all cursor-pointer flex items-center"
      >
        <i className="ri-error-warning-line text-lg"></i>
        <span className="text-sm">Wrong network</span>
        <ChevronDownIcon className="h-5 w-5" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-[100] p-2 mt-2 shadow-xl bg-slate-800 border border-slate-700 rounded-lg gap-1 min-w-[200px]"
      >
        <NetworkOptions />
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
    </div>
  );
};
