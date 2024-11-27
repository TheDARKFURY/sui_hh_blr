"use client";
import { useState } from "react";
import {
  ConnectButton,
  useAccounts,
  useCurrentWallet,
  useSignPersonalMessage,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
export default function TronLinkCard() {
  const wallet = useAccounts();
  console.log(wallet);
  const { currentWallet, connectionStatus } = useCurrentWallet();

  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const [message, setMessage] = useState(
    "You are connecting to Gaming World on Sui.place."
  );
  const [signature, setSignature] = useState("");
  const currentAccount = useCurrentAccount();
  const [name, setName] = useState("Nikku.eth");

  return (
    <Card className="w-full border-0 shadow-none">
      <CardFooter className="flex flex-col">
        <ConnectButton />

        {currentAccount && (
          <>
            <div className="">
              <div className="flex w-auto flex-col space-y-5 mt-10 mx-auto">
                <div>
                  <div className="relative mt-2 w-full">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-1 peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
                      placeholder=" "
                    />
                    <label
                      htmlFor="name"
                      className="absolute top-2 left-1 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text select-none bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-600"
                    >
                      {" "}
                      Enter Your Name{" "}
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => {
                    signPersonalMessage(
                      {
                        message: new TextEncoder().encode(message),
                      },
                      {
                        onSuccess: (result: any) =>
                          setSignature(result.signature),
                      }
                    );
                    localStorage.setItem("username", name);
                    localStorage.setItem("signature", signature);
                    localStorage.setItem("deposit", "0");
                  }}
                  className="rounded-lg bg-blue-600 py-3 font-bold text-white"
                >
                  Submit
                </button>
              </div>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
