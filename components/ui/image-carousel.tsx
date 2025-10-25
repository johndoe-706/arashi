"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setIsFullscreenOpen(true);
  };

  const nextFullscreen = () => {
    setFullscreenIndex((prev) => (prev + 1) % images.length);
  };

  const prevFullscreen = () => {
    setFullscreenIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle swipe for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };

  // Calculate thumbnail layout
  const getThumbnailRows = () => {
    if (!isMobile || images.length <= 4) {
      return [images];
    }

    const rows = [];
    const itemsPerRow = 4;
    for (let i = 0; i < images.length; i += itemsPerRow) {
      rows.push(images.slice(i, i + itemsPerRow));
    }
    return rows;
  };

  const thumbnailRows = getThumbnailRows();

  if (images.length === 0) return null;

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative aspect-video rounded-lg mb-5 overflow-hidden cursor-pointer group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            onClick={() => openFullscreen(currentIndex)}
            priority
          />

          {/* Mobile swipe indicators */}
          {isMobile && images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
              <div className="w-1/4 h-full flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/30 rounded-r-lg p-2">
                  <ChevronLeft className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="w-1/4 h-full flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/30 rounded-l-lg p-2">
                  <ChevronRight className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )}

          {!isMobile && images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <h2 className="text-3xl pt-8 font-bold text-foreground md:text-4xl">
          <span className="text-muted-foreground/30">IMAGE </span>
          GALLERY
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {images && images.length > 0
            ? images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-video relative rounded overflow-hidden"
                >
                  <Image
                    src={image}
                    alt={`Image ${index + 1}`}
                    onClick={() => openFullscreen(index)}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))
            : // Fallback images if no images are provided
              [...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="aspect-square relative rounded-lg overflow-hidden bg-background/50 flex items-center justify-center"
                >
                  <p className="text-muted-foreground">No Image</p>
                </div>
              ))}
        </div>

        {/* Thumbnail Navigation - Multi-row for mobile with more than 4 images */}
        {/* {images.length > 1 && (
          <div className="space-y-2">
            {thumbnailRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex gap-2 justify-center overflow-x-auto pb-1 px-1"
              >
                {row.map((image, index) => {
                  const actualIndex = rowIndex * 4 + index;
                  return (
                    <button
                      key={actualIndex}
                      className={`relative flex-none rounded-md overflow-hidden border-2 transition-all ${
                        actualIndex === currentIndex
                          ? "border-primary scale-105"
                          : "border-transparent opacity-70 hover:opacity-100"
                      } ${
                        isMobile
                          ? images.length <= 4
                            ? "w-20 h-16"
                            : "w-16 h-12"
                          : "w-16 h-16"
                      }`}
                      onClick={() => setCurrentIndex(actualIndex)}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${actualIndex + 1}`}
                        fill
                        className="object-cover"
                        sizes={isMobile ? "64px" : "80px"}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )} */}

        {/* Mobile dot indicators */}
        {/* {isMobile && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-accent" : "w-2 bg-muted"
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )} */}

        {/* Carousel Indicators */}
        {/* {ads.length > 0 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`h-2 rounded-full transition-all ${
                  activeSlide === idx ? "w-8 bg-accent" : "w-2 bg-muted"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )} */}
      </div>

      {/* Fullscreen Dialog - Improved for mobile */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-full h-full p-0 bg-black/95 border-0">
          <div
            className="relative h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Button
              variant="ghost"
              size="icon"
              className={`absolute z-50 text-white hover:bg-white/20 ${
                isMobile ? "top-6 right-4" : "top-4 right-4"
              }`}
              onClick={() => setIsFullscreenOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <AnimatePresence mode="wait">
              <motion.div
                key={fullscreenIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <Image
                  src={images[fullscreenIndex]}
                  alt={`${title} - Fullscreen ${fullscreenIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && (
              <>
                {!isMobile && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white hover:bg-white/30"
                      onClick={prevFullscreen}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white hover:bg-white/30"
                      onClick={nextFullscreen}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}

                {/* Mobile fullscreen navigation overlay */}
                {isMobile && (
                  <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
                    <div
                      className="h-full w-1/3 flex items-center justify-start pointer-events-auto"
                      onClick={prevFullscreen}
                    >
                      <div className="p-4 opacity-0 hover:opacity-100 transition-opacity">
                        <ChevronLeft className="h-8 w-8 text-white/70" />
                      </div>
                    </div>
                    <div
                      className="h-full w-1/3 flex items-center justify-end pointer-events-auto"
                      onClick={nextFullscreen}
                    >
                      <div className="p-4 opacity-0 hover:opacity-100 transition-opacity">
                        <ChevronRight className="h-8 w-8 text-white/70" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div
              className={`absolute text-white text-sm bg-black/50 rounded-full px-3 py-1 ${
                isMobile ? "bottom-6" : "bottom-4"
              } left-1/2 -translate-x-1/2`}
            >
              {fullscreenIndex + 1} / {images.length}
            </div>

            {/* Mobile fullscreen dot indicators */}
            {isMobile && images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === fullscreenIndex
                        ? "w-8 bg-accent"
                        : "w-2 bg-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
