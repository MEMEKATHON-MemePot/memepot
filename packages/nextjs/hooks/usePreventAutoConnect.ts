"use client";

import { useEffect } from "react";
import { useDisconnect } from "wagmi";

/**
 * Hook to prevent auto-connect on page load
 * Disconnects wallet if it was auto-connected without user interaction
 */
export const usePreventAutoConnect = () => {
  const { disconnect } = useDisconnect();

  useEffect(() => {
    // Check if there's a flag indicating manual connection
    const hasManuallyConnected = sessionStorage.getItem("wallet_manually_connected");

    if (!hasManuallyConnected) {
      // If no manual connection flag, disconnect any auto-connected wallet
      disconnect();
    }

    // Clean up the flag when component unmounts (page reload)
    return () => {
      sessionStorage.removeItem("wallet_manually_connected");
    };
  }, [disconnect]);
};

/**
 * Call this function when user manually connects wallet
 */
export const setManualConnection = () => {
  sessionStorage.setItem("wallet_manually_connected", "true");
};
