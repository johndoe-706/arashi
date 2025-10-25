"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { useLanguage } from "@/lib/language";
import { supabase } from "@/lib/supabase";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { GameCard } from "@/components/ui/GameCard";
import { PromoCard } from "@/components/ui/PromoCard";
import Image from "next/image";
import bgImg1 from "../components/image/bgImg1.png";
import BG1 from "../components/image/BG1.jpg";
import { CarouselSection } from "@/components/ui/carousel-section";

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [mlAccounts, setMlAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const { t } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!emblaApi || ads.length <= 1) return;

    const autoScroll = setInterval(() => {
      if (emblaApi) {
        emblaApi.scrollNext();
      }
    }, 3000); // Change slide every 3 seconds

    return () => {
      clearInterval(autoScroll);
    };
  }, [emblaApi, ads.length]);

  // Update active slide when carousel moves
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setActiveSlide(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch ads
      const { data: adsData } = await supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      // Fetch Mobile Legend accounts (latest 5)
      const { data: mlData } = await supabase
        .from("accounts")
        .select("*")
        .eq("category", "mobile_legend")
        .order("created_at", { ascending: false })
        .limit(6); // Get 6 accounts for the grid

      setAds(adsData || []);
      setMlAccounts(mlData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const scrollPrev = () => {
    emblaApi?.scrollPrev();
  };

  const scrollNext = () => {
    emblaApi?.scrollNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />

      {loading ? (
        <Loading />
      ) : (
        <div className="min-h-screen bg-background">
          {/* Hero Section with Carousel */}
          <section className="container mx-auto px-4 py-12">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card to-secondary">
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                  {ads.length > 0 ? (
                    ads.map((ad) => (
                      <div key={ad.id} className="flex-[0_0_100%] min-w-0">
                        <div className="relative h-64 md:h-96 bg-cover bg-center flex items-center justify-center p-8 md:p-12">
                          <Image
                            src={ad.image_url}
                            alt={ad.title || "Advertisement"}
                            fill
                            className="object-cover opacity-70"
                            priority
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-[0_0_100%] min-w-0">
                      <div className="relative h-64 md:h-96 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center p-8 md:p-12">
                        <div className="text-center">
                          <h2 className="text-2xl md:text-4xl font-bold text-white">
                            Welcome to Our Store
                          </h2>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Carousel Indicators */}
              {ads.length > 0 && (
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
              )}
            </div>
          </section>

          {/* <Image
            src={bgImg1}
            alt="testing"
            fill
            className="object-cover opacity-70"
            priority
          /> */}

          {/* Button Section */}
          <section
            className="relative container mx-auto px-4 py-8 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${BG1.src})` }} // ✅ must use bgImg1.src
          >
            {/* Optional: overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/30"></div>

            <div className=" h-96 min-h-fit">
              <div className="relative z-10 mb-16 flex justify-center">
                <div className="text-center px-8 py-6 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg">
                  <h1 className="font-bold mb-7 text-4xl">
                    Welcome to <span className="text-primary">Arashi</span>
                  </h1>
                  <p className="text-lg text-gray-100">
                    Your trusted marketplace for premium game accounts and
                    professional boosting services
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="relative flex flex-col gap-4 md:flex-row md:justify-center z-10">
                <Link
                  href="/rank-boost"
                  className="flex items-center justify-center gap-2 px-6 py-3
                  rounded-md text-white font-medium text-lg bg-gradient-to-r
                  from-purple-500 to-blue-500 hover:from-purple-600
                  hover:to-blue-600 shadow-lg hover:shadow-purple-500/30
                  transition-all duration-300"
                >
                  Rank Boost Service
                </Link>
                <Link
                  href="/mobile-legend"
                  className="flex items-center justify-center gap-2 px-6 py-3
                  rounded-md text-white font-medium text-lg bg-gradient-to-r
                  from-purple-500 to-blue-500 hover:from-purple-600
                  hover:to-blue-600 shadow-lg hover:shadow-purple-500/30
                  transition-all duration-300"
                >
                  View MLBB Accounts
                </Link>
              </div>
            </div>
          </section>

          {/* Mobile Legends Accounts Section */}
          {mlAccounts.length > 0 && (
            <section className="container mx-auto px-4 py-12">
              {/* New Arrivals - Mobile Legend */}
              {mlAccounts.length > 0 && (
                <CarouselSection title={t("hero.new_arrival_mlbb")}>
                  {mlAccounts.map((account) => (
                    <GameCard
                      id={account?.id}
                      key={account.id}
                      title={account.title}
                      image={account?.images[0]}
                      price={account.price}
                      skins={50}
                      collectorLevel={account.collector_level}
                      is_sold={account.is_sold}
                    />
                  ))}
                </CarouselSection>
              )}
            </section>
          )}

          {/* Footer */}
          <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
            <p>© 2025 DreamGames. All rights reserved.</p>
          </footer>
        </div>
      )}
    </div>
  );
}
