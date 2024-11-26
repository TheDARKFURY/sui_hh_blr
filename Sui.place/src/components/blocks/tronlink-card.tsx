"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTronLink } from "../contexts/tronlink-context";

declare global {
  interface Window {
    tronWeb: any;
  }
}

export default function TronLinkCard() {
  const { isConnected, setConnection } = useTronLink();
  const [error, setError] = useState<string | null>(null);
  const [myDetails, setMyDetails] = useState({
    name: "none",
    address: "none",
    balance: 0,
    frozenBalance: 0,
    network: "none",
    link: "false",
  });
  const getBalance = async () => {
    //if wallet installed and logged , getting TRX token balance
    if (window.tronWeb && window.tronWeb.ready) {
      const walletBalances = await window.tronWeb.trx.getAccount(
        window.tronWeb.defaultAddress.base58
      );
      return walletBalances;
    } else {
      return 0;
    }
  };

  const getWalletDetails = async () => {
    if (window.tronWeb) {
      //checking if wallet injected
      if (window.tronWeb.ready) {
        const tempBalance = await getBalance();
        const tempFrozenBalance = 0;

        if (!tempBalance.balance) {
          tempBalance.balance = 0;
        }

        //checking if any frozen balance exists
        // if (
        //   !tempBalance.frozen &&
        //   !tempBalance.account_resource.frozen_balance_for_energy
        // ) {
        //   tempFrozenBalance = 0;
        // } else {
        //   if (
        //     tempBalance.frozen &&
        //     tempBalance.account_resource.frozen_balance_for_energy
        //   ) {
        //     tempFrozenBalance =
        //       tempBalance.frozen[0].frozen_balance +
        //       tempBalance.account_resource.frozen_balance_for_energy
        //         .frozen_balance;
        //   }
        //   if (
        //     tempBalance.frozen &&
        //     !tempBalance.account_resource.frozen_balance_for_energy
        //   ) {
        //     tempFrozenBalance = tempBalance.frozen[0].frozen_balance;
        //   }
        //   if (
        //     !tempBalance.frozen &&
        //     tempBalance.account_resource.frozen_balance_for_energy
        //   ) {
        //     tempFrozenBalance =
        //       tempBalance.account_resource.frozen_balance_for_energy
        //         .frozen_balance;
        //   }
        // }

        //we have wallet and we are logged in
        setError("");
        setMyDetails({
          name: window.tronWeb.defaultAddress.name,
          address: window.tronWeb.defaultAddress.base58,
          balance: tempBalance.balance / 1000000,
          frozenBalance: tempFrozenBalance / 1000000,
          network: window.tronWeb.fullNode.host,
          link: "true",
        });
      } else {
        //we have wallet but not logged in
        setError("WALLET DETECTED PLEASE LOGIN");
        setMyDetails({
          name: "none",
          address: "none",
          balance: 0,
          frozenBalance: 0,
          network: "none",
          link: "false",
        });
      }
    } else {
      //wallet is not detected at all
      setError("WALLET NOT DETECTED");
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      getWalletDetails();
      //wallet checking interval 2sec
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      getWalletDetails();
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const checkTronLink = async () => {
      if (window.tronWeb && window.tronWeb.ready) {
        const currentAddress = window.tronWeb.defaultAddress.base58;
        setConnection(true, currentAddress);
      } else {
        setConnection(false, "");
      }
    };

    checkTronLink();

    const handleAccountsChanged = (e: MessageEvent) => {
      if (e.data.message && e.data.message.action === "setAccount") {
        checkTronLink();
      }
    };

    window.addEventListener("message", handleAccountsChanged);

    return () => {
      window.removeEventListener("message", handleAccountsChanged);
    };
  }, [setConnection]);

  const connectWallet = async () => {
    setError(null);
    if (typeof window.tronWeb === "undefined") {
      setError("TronLink is not installed. Please install it and try again.");
      return;
    }

    try {
      const accounts = await window.tronWeb.request({
        method: "tron_requestAccounts",
      });
      if (accounts.length > 0) {
        setConnection(true, accounts[0]);
      }
    } catch (err) {
      setError("Failed to connect to TronLink. Please try again.");
      console.error(err);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader>
        <CardTitle>TronLink Connection</CardTitle>
        <CardDescription>Connect your TronLink wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isConnected ? (
          <div>
            <p className="font-semibold">Wallet Name:</p>
            <p className="break-all">{myDetails.name}</p>
            <p className="font-semibold">Balance: </p>
            <p className="break-all">{myDetails.balance}</p>
            <p className="font-semibold">Connected Address:</p>
            {/* <p className="break-all">{myDetails.frozenBalance}</p>
            <p className="font-semibold">Connected Address:</p> */}
            <p className="break-all">{myDetails.address}</p>
          </div>
        ) : (
          <p>Not connected to TronLink</p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={connectWallet}
          disabled={isConnected}
          className="w-full"
        >
          {isConnected ? "Connected" : "Connect to TronLink"}
        </Button>
      </CardFooter>
    </Card>
  );
}
