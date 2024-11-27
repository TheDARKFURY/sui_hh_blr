"use client";
import { notFound } from "next/navigation";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { useGameProducts } from "@/components/contexts/developer-game-products-context";
import Roulette from "@/components/Roulette";

export default function GameDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const { products, loading } = useGameProducts();
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [animation, setAnimation] = useState("");

  const handleFlip = () => {
    if (isFlipping) return;

    const isHeads = Math.random() < 0.5;
    setIsFlipping(true);
    setAnimation(isHeads ? "spin-heads" : "spin-tails");

    setTimeout(() => {
      setAnimation("");
      if (isHeads) {
        setHeads((prev) => prev + 1);
      } else {
        setTails((prev) => prev + 1);
      }
      setIsFlipping(false);
    }, 3000);
  };

  const handleReset = () => {
    setHeads(0);
    setTails(0);
    setAnimation("");
  };
  const games: { [key: string]: Game } = products
    .map((game) => ({
      [game.id]: game,
    }))
    .reduce((acc, game) => ({ ...acc, ...game }), {});
  const game = games[params.slug];
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!game) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 justify-center">
          {params.slug === "3" && <Roulette/>}
          {params.slug === "2" && (
            <>
              <div className="my-10 w-1/3">
                <div className="mt-2 flex flex-col items-start rounded-md border border-gray-100 bg-white px-4 pt-3 pb-6 shadow-lg">
                  <strong className="block text-lg font-medium">
                    Pool Analytics
                  </strong>
                  <div className="mt-4 flex items-center text-xs text-gray-400">
                    UP
                    <div className="ml-4 h-4 w-36 overflow-hidden rounded-md bg-gray-100 sm:w-56">
                      <div className="h-full w-3/5 bg-yellow-200"></div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-xs text-gray-400">
                    NO
                    <div className="ml-4 h-4 w-36 overflow-hidden rounded-md bg-gray-100 sm:w-56">
                      <div className="h-full w-2/5 bg-gray-800"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-start rounded-md border border-gray-100 bg-white px-4 pt-3 pb-6 shadow-lg">
                 <div className="px-2 py-2 w-full bg-green-400 rounded-md shadow-lg cursor-pointer flex justify-center font-bold">Up </div>

                 <div className="px-2 py-2 mt-4 rounded-md w-full h-[40%] border">

                 </div>
                  
                 <div className="px-2 py-2 w-full bg-red-400 rounded-md shadow-lg mt-4 cursor-pointer flex justify-center font-bold">Down </div>
                </div>
              </div>
            </>
          )}
          {params.slug === "1" && (
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {game.title}
              </h1>
              <Badge variant="secondary" className="mb-4">
                Coin FLip
              </Badge>

              <div className="container-coin">
                <div className={`coin ${animation}`} id="coin">
                  <div className="heads">
                    <img
                      src="https://live.staticflickr.com/227/1491049183_4fe2ede120_w.jpg"
                      alt="Heads"
                    />
                  </div>
                  <div className="tails">
                    <img
                      src="https://media.istockphoto.com/id/486748452/vector/united-states-currency-nickel-coin.jpg?s=612x612&w=0&k=20&c=9ey7MC3ayRWgpO9vqhF5cfYRcXelYvhkNisNyIfTUJE="
                      alt="Tails"
                    />
                  </div>
                </div>
                <div className="stats flex gap-12 font-bold text-xl">
                  <p>Heads: {heads}</p>
                  <p>Tails: {tails}</p>
                </div>
                <div className="buttons font-bold text-xl">
                  <button
                    id="flip-button"
                    onClick={handleFlip}
                    disabled={isFlipping}
                  >
                    Flip Coin
                  </button>
                  <button id="reset-button" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
