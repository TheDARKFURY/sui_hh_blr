import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TronLinkProvider } from "@/components/contexts/tronlink-context";
import { CartProvider } from "@/components/contexts/cart-context";
import { ToastProvider } from "@/components/ui/toast";
import { GameProductsProvider } from "@/components/contexts/developer-game-products-context";


export const metadata: Metadata = {
  title: "MintyPlay",
  description: "Buy and play blockchain games with TRX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <GameProductsProvider>
          <TronLinkProvider>
            <ToastProvider>
              <CartProvider>{children}</CartProvider>
            </ToastProvider>
          </TronLinkProvider>
        </GameProductsProvider>
      </body>
    </html>
  );
}
