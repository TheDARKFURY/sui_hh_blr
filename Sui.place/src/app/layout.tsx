import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/contexts/cart-context";
import { ToastProvider } from "@/components/ui/toast";
import { GameProductsProvider } from "@/components/contexts/developer-game-products-context";
import { SuiLinkProvider } from "@/components/contexts/suilink-context";

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
      <body className={`antialiased`}>
        <GameProductsProvider>
          <SuiLinkProvider>
            <ToastProvider>
              <CartProvider>{children}</CartProvider>
            </ToastProvider>
          </SuiLinkProvider>
        </GameProductsProvider>
      </body>
    </html>
  );
}
