"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface AccountCardProps {
  id: string;
  title: string;
  price: number;
  discount?: number;
  images: string[];
  category: string;
  collectorLevel?: string;
  isSold: boolean;
}

export function AccountCard({
  id,
  title,
  price,
  discount,
  images,
  category,
  collectorLevel,
  isSold,
}: AccountCardProps) {
  const finalPrice = discount ? price - (price * discount) / 100 : price;
  const thumbnailImage = images[0];

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
          <Link href={`/offers/${encodeURIComponent(id)}`}>
          <div className="relative aspect-video">
            <Image
              src={thumbnailImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {isSold && (
              <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                Sold Out
              </Badge>
            )}
            {discount && !isSold && (
              <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
                -{discount}%
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
              Code - {title}
            </h3>

            {collectorLevel && (
              <Badge variant="outline" className="mb-2 text-xs">
                {collectorLevel}
              </Badge>
            )}

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {discount ? (
                  <>
                    <span className="text-lg font-bold text-primary">
                      {Math.floor(finalPrice).toLocaleString()} MMK
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {Math.floor(price).toLocaleString()} MMK
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-primary">
                    {Math.floor(price).toLocaleString()} MMK
                  </span>
                )}
              </div>
              <Link
                href={`/offers/${id}`}
                className="ml-4 px-3 py-1 rounded bg-primary text-white dark:text-black text-xs font-medium hover:bg-primary/80 transition"
              >
                View
              </Link>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}
