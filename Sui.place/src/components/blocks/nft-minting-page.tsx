"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Upload,
  Check,
  Image as ImageIcon,
  ChevronLeft,
} from "lucide-react";
import { useTronLink } from "@/components/contexts/tronlink-context";
import Link from "next/link";

declare global {
  interface Window {
    tronWeb: any;
  }
}

export function NftMintingPage() {
  const { isConnected, address } = useTronLink();
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [tronWeb, setTronWeb] = useState<any>(null);
  const [step, setStep] = useState(0);
  const NFT_SMARTCONTRACT_ADDRESS = process.env.NFT_SMARTCONTRACT_ADDRESS;
  const BTFS_RSA_URL = process.env.BTFS_RSA_URL;

  useEffect(() => {
    const _tronWeb = window.tronWeb;
    if (!_tronWeb || !_tronWeb.defaultAddress.base58) {
      console.error("TronLink is not installed or logged in!");
    } else {
      console.log("TronLink connected:", _tronWeb.defaultAddress.base58);
      setTronWeb(_tronWeb);
    }
  }, []);

  const getBTFSRSA = async (file: File) => {
    try {
      console.log("Uploading file to BTFS...");
      const formData = new FormData();
      formData.append("file", file);
      // In a real scenario, you would upload the file to BTFS here
      // and get back a CID (Content Identifier)
      const response = await fetch(`${BTFS_RSA_URL}/upload`, {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: formData,
      });
      if (response.ok) {
        const res = await response.json();
        console.log("File uploaded to BTFS:", res.encrypted_hash);
        return res.encrypted_hash;
      } else {
        throw new Error("Failed to get CID from BTFS");
      }
    } catch (error) {
      console.error("Error uploading to BTFS:", error);
      throw error;
    }
  };

  const mintNFT = async (RSA: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Smart Contract Details
      const contractAddress = NFT_SMARTCONTRACT_ADDRESS; // Replace with your NFT contract address
      const recipientAddress = tronWeb.defaultAddress.base58; // NFT will be minted to the connected user's address
      const MINT_METHOD_NAME =
        process.env.MINT_METHOD_NAME || "defaultMintMethod"; // Name of the minting function in the smart contract
      // Set parameters for the minting function
      const tokenURI = RSA; // URI for the NFT metadata
      console.log(Date.now());
      const args = [recipientAddress, Date.now(), tokenURI]; // Arguments needed for the mint function

      // Access the contract using TronWeb
      const contract = await tronWeb.contract().at(contractAddress);
      console.log("Contract:", contract);
      // Call the mint function on the smart contract
      if (!contract[MINT_METHOD_NAME]) {
        throw new Error(
          `Mint method ${MINT_METHOD_NAME} not found in the contract`
        );
      }
      const transaction = await contract[MINT_METHOD_NAME](...args).send({
        feeLimit: 100_000_000, // Adjust fee limit as needed
        callValue: 0, // No TRX sent along with the transaction
        shouldPollResponse: true,
        keepTxID: true,
      });
      console.log("Transaction", transaction);
      const transactionHash = transaction[0];
      setStep(3);
      const receipt = await verifyTransaction(transactionHash);
      if (receipt) {
        console.log("Transaction was successful:", receipt);
        setReceipt(receipt);
      } else {
        throw new Error("Transaction failed or is pending.");
      }
    } catch (err: any) {
      console.error("Error minting NFT:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTransaction = async (transactionHash: string) => {
    try {
      let retries = 10; // Number of times to retry before giving up
      let receipt = null;

      while (retries > 0) {
        receipt = await tronWeb.trx.getTransactionInfo(transactionHash);
        console.log("Receipt:", receipt);
        if (receipt && receipt.receipt.result === "SUCCESS") {
          return receipt;
        } else {
          retries--;
          console.log(`Retrying... (${10 - retries} of 10)`);
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
        }
      }

      return receipt; // If still null, transaction might have failed
    } catch (err) {
      console.error("Error verifying transaction:", err);
    }
  };

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Free memory when this component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setReceipt(null);

    try {
      if (file) {
        setStep(1);
        const RSA = await getBTFSRSA(file);
        setStep(2);
        await mintNFT(RSA);
      } else setError("Please select a file to mint as an NFT");
    } catch (error) {
      console.error("Minting failed:", error);
      setError("Failed to mint NFT. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center p-4 relative">
      <Link href="/" className="absolute top-4 left-4 md:top-8 md:left-8">
        <Button
          variant="outline"
          className="flex items-center space-x-2 bg-white hover:bg-green-50 text-green-600 border-green-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Button>
      </Link>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full bg-white shadow-xl border border-green-200">
          <CardHeader className="border-b border-green-100">
            <CardTitle className="text-2xl font-bold text-primary">
              Mint Your NFT
            </CardTitle>
            <CardDescription className="text-green-500">
              Create a unique NFT on the Tron network
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="NFT Preview"
                    className="w-48 h-48 object-cover rounded-lg shadow-md mb-4"
                  />
                ) : (
                  <div className="w-48 h-48 bg-green-100 rounded-lg shadow-md mb-4 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-green-300" />
                  </div>
                )}
                <Label
                  htmlFor="file"
                  className="cursor-pointer bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-300 ease-in-out"
                >
                  {file ? "Change Image" : "Upload Image"}
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-green-700">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Name of your NFT"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  className="mt-1 border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-green-700">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Describe your NFT"
                  value={nftDescription}
                  onChange={(e) => setNftDescription(e.target.value)}
                  className="mt-1 border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>
            </form>
            {error && (
              <Alert
                variant="destructive"
                className="mt-4 bg-red-50 border-red-200 text-red-700"
              >
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {receipt && (
              <Alert className="mt-4 bg-green-50 border-green-200 text-green-700">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Transaction ID: {receipt.id}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-green-100 pt-6">
            {!isConnected ? (
              <Button
                variant="secondary"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Connect Wallet
              </Button>
            ) : (
              <Button
                // onClick={handleMint}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="animate-spin" />
                    <span>
                      {step === 1
                        ? "Uploading to BTFS..."
                        : step === 2
                        ? "Minting NFT..."
                        : "Verifying Transaction..."}
                    </span>
                  </div>
                ) : (
                  // "Mint NFT"
                  "Demo Disabled due to Gas Fees"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
      {isLoading && (
        <div className="fixed bottom-4 left-4 right-4">
          <div className="bg-green-100 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
