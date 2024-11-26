"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCart } from "../contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import React from "react";

declare global {
  interface Window {
    tronWeb: any;
  }
}

interface TransactionInfo {
  id: string;
  blockNumber: number;
  blockTimeStamp: number;
  ret: Array<{
    contractRet: string;
  }>;
  receipt: {
    energy_usage: number;
    energy_fee: number;
    origin_energy_usage: number;
    energy_usage_total: number;
    net_fee: number;
    result: string;
  };
}

interface DeveloperTransaction {
  developerAddress: string;
  amount: number;
  transactionId: string;
  status: "pending" | "success" | "error";
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds
const FASTAPI_URL = process.env.FASTAPI_URL;

export default function EnhancedCheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [total, setTotal] = useState(0);
  const [tronWeb, setTronWeb] = useState<any>(null);
  const [userAddress, setUserAddress] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState<
    "idle" | "loading" | "validating" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [developerTransactions, setDeveloperTransactions] = useState<
    DeveloperTransaction[]
  >([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadTronWeb = async () => {
      if (window.tronWeb && window.tronWeb.ready) {
        setTronWeb(window.tronWeb);
        try {
          const address = await window.tronWeb.trx.getAccount();
          setUserAddress(address.address || "");
        } catch (error) {
          console.error("Error getting TronWeb account:", error);
          setUserAddress("");
          toast({
            title: "Error",
            description:
              "Failed to get TronWeb account. Please make sure you're connected to TronLink.",
            variant: "destructive",
          });
        }
      } else {
        console.error("TronWeb not found. Please install TronLink extension.");
        setUserAddress("");
        toast({
          title: "TronLink Not Found",
          description:
            "Please install TronLink extension and connect your wallet.",
          variant: "destructive",
        });
      }
    };

    loadTronWeb();
  }, [toast]);

  useEffect(() => {
    setTotal(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [cart]);

  const handlePurchase = async () => {
    if (!tronWeb) {
      setErrorMessage(
        "TronWeb not initialized. Please install TronLink extension."
      );
      setPurchaseStatus("error");
      return;
    }

    setPurchaseStatus("loading");
    setErrorMessage("");
    setDeveloperTransactions([]);

    try {
      // Group cart items by developer wallet address
      const developerPayments = cart.reduce((acc, item) => {
        const { developer_wallet_address, price, quantity } = item;
        if (!acc[developer_wallet_address]) {
          acc[developer_wallet_address] = 0;
        }
        acc[developer_wallet_address] += price * quantity;
        return acc;
      }, {} as { [key: string]: number });

      // Create and send transactions for each developer
      for (const [developerAddress, amount] of Object.entries(
        developerPayments
      )) {
        const amountInSun = tronWeb.toSun(amount);

        try {
          const transaction = await tronWeb.transactionBuilder.sendTrx(
            developerAddress,
            amountInSun,
            userAddress
          );
          const signedTransaction = await tronWeb.trx.sign(transaction);
          const result = await tronWeb.trx.sendRawTransaction(
            signedTransaction
          );

          setDeveloperTransactions((prev) => [
            ...prev,
            {
              developerAddress,
              amount,
              transactionId: result.txid,
              status: "pending",
            },
          ]);

          toast({
            title: "Transaction Sent",
            description: `Transaction for ${amount} TRX sent to ${developerAddress}`,
          });

          // Start validating the transaction
          validateTransaction(result.txid, developerAddress);
        } catch (error) {
          console.error(
            `Error sending transaction to ${developerAddress}:`,
            error
          );
          setDeveloperTransactions((prev) => [
            ...prev,
            {
              developerAddress,
              amount,
              transactionId: "",
              status: "error",
            },
          ]);
        }
      }

      setPurchaseStatus("validating");
    } catch (error) {
      console.error("Purchase failed:", error);
      setErrorMessage("Purchase failed. Please try again.");
      setPurchaseStatus("error");
    }
  };
  //TODO: Implement handleGamePurchase
  // const handleGamePurchase = async (e:React.FormEvent) => {

  //   e.preventDefault();
  //   try {
  //     const response = await fetch(`${FASTAPI_URL}/`, {
  //   });
  // }

  const validateTransaction = async (
    txId: string,
    developerAddress: string,
    retries = 0
  ) => {
    try {
      const transactionInfo: TransactionInfo = await tronWeb.trx.getTransaction(
        txId
      );

      if (!transactionInfo) {
        throw new Error("Transaction not found");
      }

      if (
        transactionInfo.ret &&
        transactionInfo.ret[0] &&
        transactionInfo.ret[0].contractRet === "SUCCESS"
      ) {
        const transactionDetails = await tronWeb.trx.getTransactionInfo(txId);

        setDeveloperTransactions((prev) =>
          prev.map((tx) =>
            tx.transactionId === txId
              ? { ...tx, status: "success" as const }
              : tx
          )
        );

        toast({
          title: "Transaction Confirmed",
          description: `Payment to ${developerAddress} has been confirmed on the blockchain.`,
        });

        // Check if all transactions are successful
        const allSuccess = developerTransactions.every(
          (tx) => tx.status === "success"
        );
        if (allSuccess) {
          setPurchaseStatus("success");
          clearCart();
        }
      } else {
        throw new Error("Transaction failed or is still pending");
      }
    } catch (err) {
      console.error(err);
      if (retries < MAX_RETRIES) {
        setTimeout(
          () => validateTransaction(txId, developerAddress, retries + 1),
          RETRY_DELAY
        );
      } else {
        setDeveloperTransactions((prev) =>
          prev.map((tx) =>
            tx.transactionId === txId ? { ...tx, status: "error" as const } : tx
          )
        );
        setErrorMessage(
          `Failed to validate the transaction for ${developerAddress} after multiple attempts.`
        );
        setPurchaseStatus("error");
      }
    }
  };

  const handleReturnToPreviousPage = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        onClick={handleReturnToPreviousPage}
        variant="outline"
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Previous Page
      </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Cart</h3>
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <span>
                      {item.title} (x{item.quantity})
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p>Your cart is empty.</p>
              )}
              <div className="flex justify-between items-center py-2 font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="wallet-address">Your TRX Wallet Address</Label>
              <Input
                id="wallet-address"
                value={userAddress}
                readOnly
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch">
          <Button
            onClick={handlePurchase}
            disabled={
              purchaseStatus === "loading" ||
              purchaseStatus === "validating" ||
              !tronWeb ||
              cart.length === 0
            }
            className="w-full mb-4"
          >
            {purchaseStatus === "loading" || purchaseStatus === "validating" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {purchaseStatus === "loading"
                  ? "Processing..."
                  : "Validating..."}
              </>
            ) : (
              `Pay ${total.toFixed(2)} TRX`
            )}
          </Button>
          {developerTransactions.map((tx, index) => (
            <Alert
              key={index}
              variant={
                tx.status === "success"
                  ? "default"
                  : tx.status === "error"
                  ? "destructive"
                  : "default"
              }
              className="mb-2"
            >
              <AlertTitle>
                {tx.status === "success"
                  ? "Payment Successful"
                  : tx.status === "error"
                  ? "Payment Failed"
                  : "Payment Pending"}
              </AlertTitle>
              <AlertDescription>
                {tx.amount} TRX to {tx.developerAddress}
                {tx.status === "success" &&
                  ` (Transaction ID: ${tx.transactionId})`}
              </AlertDescription>
            </Alert>
          ))}
          {purchaseStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
