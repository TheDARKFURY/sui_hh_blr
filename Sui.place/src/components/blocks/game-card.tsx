"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "../contexts/cart-context";

// interface Game {
//   id: number;
//   title: string;
//   image: {
//     src: string;
//   };
//   price: number;
//   genre: string;
//   nftRewards: string[];
//   tags: string[];
// }

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const { addToCart, cart } = useCart();

  return (
    <Card key={game.id}>
      <CardHeader>
        <a href={"/games/" + game.id}>
          <CardTitle>{game.title}</CardTitle>
        </a>
      </CardHeader>
      <CardContent>
        <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-lg bg-muted mb-4">
          <img
            src="https://www.kundanrefinery.com/pub/media/catalog/product/cache/a6819a77997e6f5ec84977f1af72369f/k/r/kr337-a_1.jpg"
            alt={game.title}
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-2xl font-bold text-primary">$Sui 12</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Play</Button>
      </CardFooter>
    </Card>
  );
}
