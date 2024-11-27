"use client";
import React, { ReactNode, use, useEffect, useState } from "react";
import { Menu, MenuIcon, SearchIcon, ShoppingCartIcon, X } from "lucide-react";
import StoreDashboardSheet from "../buttons/store-dashboard-sheet";
import { Button } from "./button";
import Link from "next/link";
import { Input } from "./input";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  
} from "@mysten/dapp-kit";
import toast, { Toaster } from 'react-hot-toast';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import LoginForm from "../blocks/authentication-02";
import TronlinkCard from "../blocks/tronlink-card";
import { DialogHeader } from "./dialog";
// import cartItems from "@/components/assets/database";
import { Label } from "./label";
import { useCart } from "../contexts/cart-context";
import { Alert } from "./alert";
const FASTAPI_URL = process.env.FASTAPI_URL;

const NavBar = () => {
  const { cart, isInitialized, removeFromCart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [isLinkWalletOpen, setIsLinkWalletOpen] = useState(false);
  const [navCart, setCart] = useState<typeof cart>([]);
  const [alert, setAlert] = useState<ReactNode>(<React.Fragment />);
  const [depositAmount, setDepositAmount] = useState(0);

  const isConnected = false;
  const address = "";

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
 
  
  const deposit_tournament = async () => {
    let id = toast.loading("Depositing...");
    try {
      const tx = new Transaction();
      const coin = await coinWithBalance({ balance: 1000000000 });
      tx.moveCall({
        target:
          "0xe41824362e8338420833f6927ec6af7a67de8547add6410dec341b1bdee101c6::treasury::deposit_private_room",

        typeArguments: ["0x2::sui::SUI"],

        arguments: [
          tx.object(
            "0xc32def673f0eedef66f348035dc062d05360ebf655f996358a86aaa20813c0b9"
          ),
          tx.object(
            "0x676b89d0c59001ac6c36d50bbecf6035a84ae56876f76519ebcc6595fa3b3c10"
          ),
          tx.object(coin),
        ],
      });
      tx.setSender(currentAccount!.address);

      const response = await signAndExecuteTransaction(
        {
          transaction: tx,
       
        },

        {
          onSuccess: (result:any) => {
            console.log("executed transaction", result);
          },
          onError: (error:any) => {
            console.log("error", error);
          },
        }
      );
      let depositAmount = JSON.parse(localStorage.getItem("deposit"));
      if (depositAmount) {
        depositAmount = depositAmount + 1000000000;
        localStorage.setItem("deposit", JSON.stringify(depositAmount));
      }

      toast.success("Deposited 1 SUI", { id });

    } catch (error) {
      console.log("error", error);
      toast.error("Error depositing", { id });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempted with:", loginEmail, loginPassword);
    // Here you would typically make an API call to authenticate the user
    // setIsAuthOpen(false);
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleAuthWindow = () => {
    setIsAuthOpen(!isAuthOpen);
    setSignUpName("");
    setAlert(<React.Fragment />);
    setSignUpEmail("");
    setSignUpPassword("");
    setSignUpConfirmPassword("");
  };

  useEffect(() => {
    setCart(cart);
  }, [isInitialized, cart]);
  // Placeholder sign up function
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "Sign up attempted with:",
      signUpEmail,
      signUpPassword,
      signUpConfirmPassword
    );
    // Here you would typically make an API call to register the user
    const signUp = async () => {
      if (signUpPassword !== signUpConfirmPassword) {
        return setAlert(
          <Alert variant="destructive">Password does not Match</Alert>
        );
      }
      await fetch(`${FASTAPI_URL}/v1/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: signUpName,
          email: signUpEmail,
          password: signUpPassword,
        }),
      })
        .then(async (response) => {
          if (response.ok) {
            setAlert(
              <Alert variant="default">Account Created Successfully</Alert>
            );
            setSignUpName("");
            // setIsAuthOpen(false);
            setSignUpEmail("");
            setSignUpPassword("");
            setSignUpConfirmPassword("");
            setAlert(<React.Fragment />);
          } else {
            const responseData = await response.json();
            // console.log("Response:", responseData.detail); // Log the response details
            setAlert(
              <Alert variant="destructive">{responseData.detail}</Alert>
            );
          }
        })
        .catch((error) => {
          console.error("Error:", error.message); // Log the error message
        });
    };
    signUp();
  };

  return (
    <>
      <nav className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="pr-8">
                <StoreDashboardSheet menu_view="store">
                  <Button variant={"ghost"}>
                    <Menu className="h-6 w-6" />
                  </Button>
                </StoreDashboardSheet>
              </div>
              <Link href="/" className="text-2xl font-bold text-primary mr-8">
                Sui.Discover
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/games"
                  className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Games
                </Link>

                <Link
                  href="/nft-mint"
                  className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Communities
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="flex items-center">
                  <Input
                    type="search"
                    placeholder="Search games..."
                    className="w-64 mr-2"
                  />
                  <Button variant="outline" size="icon">
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ShoppingCartIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                   
                    {navCart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center mb-2"
                      >
                        <div>
                          <p className="font-medium">{item.title}</p>
                        </div>
                        <p>$TRX {item.price.toFixed(2)}</p>
                        <X
                          className="h-4 w-4 cursor-pointer"
                          onClick={() => removeFromCart(item.id)}
                        />
                      </div>
                    ))}
                    <div className="border-t mt-4 pt-4">
                      <div className="flex justify-between font-semibold">
                        <p>Deposit Amount:</p>
                        <p>
                          {JSON.parse(localStorage.getItem("deposit")) ? JSON.parse(localStorage.getItem("deposit")) : 10000} Mist
                        </p>
                      </div>
                    </div>
                      <input

                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full mt-4 p-2 border border-gray-300 rounded-md"
                      />
                      
                      <Button onClick={async ()=>{
                        await deposit_tournament("0x783b3ab2755c6c2686370993f8925daf222fac4252354b37d1972cefe099085c",
                        "0x676b89d0c59001ac6c36d50bbecf6035a84ae56876f76519ebcc6595fa3b3c10")
                      }} className="w-full mt-4">Deposit</Button>
                    
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog
                open={isLinkWalletOpen}
                onOpenChange={setIsLinkWalletOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    className={isConnected ? "bg-emerald-800" : ""}
                  >
                    {isConnected
                      ? `Connected: ${address.slice(0, 6)}...${address.slice(
                          -4
                        )}`
                      : "Link Wallet"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <TronlinkCard />
                </DialogContent>
              </Dialog>
              <Dialog open={isAuthOpen} onOpenChange={handleAuthWindow}>
                <DialogTrigger asChild>
                  <Button variant="default">Login / Sign Up</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Account</DialogTitle>
                    <DialogDescription>
                      Login to your account or create a new one.
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <LoginForm />
                        {/* <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          />
                          </div>
                          <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          />
                          </div>
                          <Button type="submit" className="w-full">
                          Login
                          </Button> */}
                      </form>
                    </TabsContent>
                    <TabsContent value="signup">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        {alert}
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Name</Label>
                          <Input
                            id="signup-name"
                            type="name"
                            placeholder="Enter your name"
                            value={signUpName}
                            onChange={(e) => setSignUpName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Create a password"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm-password">
                            Confirm Password
                          </Label>
                          <Input
                            id="signup-confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            value={signUpConfirmPassword}
                            onChange={(e) => {
                              if (signUpPassword !== signUpConfirmPassword) {
                                <Alert variant="destructive">
                                  Passwords do not match
                                </Alert>;
                              } else {
                                <Alert variant="default">
                                  Passwords match
                                </Alert>;
                              }
                              setSignUpConfirmPassword(e.target.value);
                            }}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Sign Up
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              <div className="md:hidden">
                <Button variant="outline" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      ;
    </>
  );
};

export default NavBar;
