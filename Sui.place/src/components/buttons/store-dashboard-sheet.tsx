"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LayoutDashboard, ShoppingBag } from "lucide-react";

interface StoreDashboardSheetProps {
  menu_view: "developer" | "player" | "store";
  children: React.ReactNode;
}

export default function StoreDashboardSheet({
  children,
  menu_view,
}: StoreDashboardSheetProps) {
  const [view, setView] = useState<"developer" | "player" | "store">(
    "developer"
  );
  useEffect(() => {
    setView(menu_view);
  }, [menu_view]);
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side={"left"}>
        <SheetHeader>
          <SheetTitle>Store Navigation</SheetTitle>
          <SheetDescription>
            Switch between dashboard and store views.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <a href="/">
            <Button
              variant={view === "store" ? "default" : "outline"}
              className="w-full"
              onClick={() => setView("store")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Main Store
            </Button>
          </a>
          <a href="/developer">
            <Button
              variant={view === "developer" ? "default" : "outline"}
              className="w-full"
              onClick={() => setView("developer")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Developer Dashboard
            </Button>
          </a>
          <a href="/player-dashboard">
            <Button
              variant={view === "player" ? "default" : "outline"}
              className="w-full line-through"
              onClick={() => setView("player")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Player Dashboard
            </Button>
          </a>
        </div>
        <div className="mt-4 rounded-md bg-muted p-4">
          <h3 className="mb-2 text-sm font-medium">Current View:</h3>
          <p className="text-sm">{view}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
