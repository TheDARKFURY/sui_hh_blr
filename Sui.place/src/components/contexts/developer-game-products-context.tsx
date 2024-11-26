"use client";
import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
} from "react";

// Define the context type

interface GameProductsContextType {
  products: Game[];
  addProduct: (product: Game) => void;
  loading: boolean;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    games: Game[];
  };
  timestamp: string;
}

// Create the context with default values
const GameProductsContext = createContext<GameProductsContextType | undefined>(
  undefined
);
const FASTAPI_URL = process.env.FASTAPI_URL;

// Create a provider component
export const GameProductsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([
    {
      id: "1",
      title: "Coin Flip",
      image: "/images/crypto-legends.jpg",
    },
    {
      id: "2",
      title: "Blockchain Raiders",
      image: "/images/blockchain-raiders.jpg",
    },
    {
      id: "3",
      title: "DeFi Warriors",
      image: "/images/defi-warriors.jpg",
    },
    {
      id: "4",
      title: "Metaverse Explorers",
      image: "/images/metaverse-explorers.jpg",
    },
    {
      id: "5",
      title: "Token Tactics",
      image: "/images/token-tactics.jpg",
    },
    {
      id: "6",
      title: "NFT Racing League",
      image: "/images/nft-racing-league.jpg",
    },
    {
      id: "7",
      title: "Staking Kingdoms",
      image: "/images/staking-kingdoms.jpg",
    },
    {
      id: "8",
      title: "ZK Battles",
      image: "/images/zk-battles.jpg",
    },
    {
      id: "9",
      title: "CrossChain Heroes",
      image: "/images/crosschain-heroes.jpg",
    },
    {
      id: "10",
      title: "Layer Zero Adventures",
      image: "/images/layer-zero-adventures.jpg",
    },
  ]);
  

  const retrieveGameProducts = async () => {
    try {
      const response = await fetch(`${FASTAPI_URL}/v1/games/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      // console.log("Response status:", response.status);
      // console.log("Response headers:", response.headers);
      // console.log("Response body:", await response.json());
      //console.log(response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result: ApiResponse = await response.json();
      //console.log("Result:", result.data.games);
      setProducts(result.data.games as Game[]);
      //console.log("Products:", products);
      //console.log("Loading:", loading);
    } catch (err) {
      console.error("There was a problem with the fetch operation:", err);
    } finally {
      setLoading(false);
      //console.log("Loading:", loading);
    }
  };
  useEffect(() => {
    retrieveGameProducts();
  }, []);

  const addProduct = (product: Game) => {
    setProducts((prevProducts = []) => [...prevProducts, product]);
  };

  return (
    <GameProductsContext.Provider value={{ products, addProduct, loading }}>
      {children}
    </GameProductsContext.Provider>
  );
};

// Export the context and provider
export const useGameProducts = () => {
  const context = useContext(GameProductsContext);
  if (context === undefined) {
    throw new Error(
      "useGameProducts must be used within a GameProductsProvider"
    );
  }
  return context;
};
