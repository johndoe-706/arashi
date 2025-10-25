import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface PromoCardProps {
  title: string;
  highlight: string;
  description: string;
  images: string[];
  buttonText: string;
}

export function PromoCard({
  title,
  highlight,
  description,
  images,
  buttonText,
}: PromoCardProps) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card">
      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
        <div className="grid grid-cols-3 gap-2 md:w-1/3">
          {images.map((img, idx) => (
            <div key={idx} className="aspect-[3/4] overflow-hidden rounded-lg">
              <Image
                width={150}
                height={150}
                src={img}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-bold">
            <span className="text-accent">{highlight}</span>{" "}
            <span className="text-foreground">{description}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Only on DreamGames every week you will have an exclusive offer with
            the best prices!
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            {buttonText}
          </Button>
        </div>
      </div>
    </Card>
  );
}
