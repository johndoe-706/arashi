import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "./badge";

interface GameCardProps {
  id: string;
  title: string;
  image: string;
  price: string;
  skins: number;
  collectorLevel?: string;
  is_sold?: boolean;
}

export function GameCard({
  id,
  title,
  image,
  price,
  skins,
  collectorLevel,
  is_sold,
}: GameCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card transition-all hover:scale-[1.02] hover:shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden">
        {is_sold && (
          <div className="absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">
            SOLD
          </div>
        )}

        <Image
          src={image}
          alt={title}
          width={500}
          height={281}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
      </div>

      <div className="space-y-3 p-4">
        {collectorLevel && (
          <Badge variant="outline" className=" text-sm">
            {collectorLevel}
          </Badge>
        )}

        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-card-foreground line-clamp-1">
            {title}
          </h3>
          <h3>Skins: {skins}</h3>
        </div>

        <hr />

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            {price.toLocaleString()} MMK
          </span>
          <Link href={`/offers/${id}`}>
            <Button size="sm" className="bg-accent hover:bg-primary/90">
              View
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
