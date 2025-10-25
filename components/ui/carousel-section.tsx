"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";

interface CarouselSectionProps {
  title: string;
  children: React.ReactNode[];
}

export function CarouselSection({ title, children }: CarouselSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            <span className="text-muted-foreground/30">NEW </span>
            ACCOUNTS
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-4">
            {children.map((child, index) => (
              <div
                key={index}
                className="embla__slide flex-none w-64 md:w-72 lg:w-80"
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
