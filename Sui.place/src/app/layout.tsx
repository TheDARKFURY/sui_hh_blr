import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/contexts/cart-context";
import toast, { Toaster } from "react-hot-toast";
import { GameProductsProvider } from "@/components/contexts/developer-game-products-context";
import { SuiLinkProvider } from "@/components/contexts/suilink-context";

export const metadata: Metadata = {
  title: "Sui.Discover",
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
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                // Define default options
                className: "",
                duration: 5000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },

                // Default options for specific types
                success: {
                  duration: 3000,
                  theme: {
                    primary: "green",
                    secondary: "black",
                  },
                },
              }}
            />
            <CartProvider>{children}</CartProvider>
          </SuiLinkProvider>
        </GameProductsProvider>
      </body>
    </html>
  );
}
