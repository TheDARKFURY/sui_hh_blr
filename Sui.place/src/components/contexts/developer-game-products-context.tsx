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
      image: "https://www.kundanrefinery.com/pub/media/catalog/product/cache/a6819a77997e6f5ec84977f1af72369f/k/r/kr337-a_1.jpg",
    },
    {
      id: "2",
      title: "Price Prediction",
      image: "https://academy-public.coinmarketcap.com/optimized-uploads/a189e72d71ad447b985f6d8ad225ba5a.jpeg",
    },
    {
      id: "3",
      title: "Roulette",
      image: "https://m.media-amazon.com/images/I/61u26l97ssL._UF1000,1000_QL80_.jpg",
    },
    {
      id: "4",
      title: "Snake Run",
      image: "https://m.media-amazon.com/images/I/81t8t9TyYLL.png",
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
