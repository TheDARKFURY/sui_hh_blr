"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";

import "@mysten/dapp-kit/dist/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const { networkConfig } = createNetworkConfig({
  testnet: { url: "https://rpc-testnet.suiscan.xyz/" },  
});

const queryClient = new QueryClient();

interface SuiLinkContextType {
  isConnected: boolean;
  address: string;
  setConnection: (isConnected: boolean, address: string) => void;
}

const SuiLinkContext = createContext<SuiLinkContextType | undefined>(undefined);

export const SuiLinkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const storedConnection = localStorage.getItem("SuiLinkConnection");
    if (storedConnection) {
      const { isConnected, address } = JSON.parse(storedConnection);
      setIsConnected(isConnected);
      setAddress(address);
    }
  }, []);

  const setConnection = (isConnected: boolean, address: string) => {
    setIsConnected(isConnected);
    setAddress(address);
    localStorage.setItem(
      "SuiLinkConnection",
      JSON.stringify({ isConnected, address })
    );
  };

  return (
    <SuiLinkContext.Provider value={{ isConnected, address, setConnection }}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider
            autoConnect={true}
            stashedWallet={{
              name: "Baskt",
            }}
          >
            {children}
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </SuiLinkContext.Provider>
  );
};

export const useSuiLink = () => {
  const context = useContext(SuiLinkContext);
  if (context === undefined) {
    throw new Error("useSuiLink must be used within a SuiLinkProvider");
  }
  return context;
};
