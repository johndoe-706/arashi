"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

import BG1 from "../components/image/BG1.jpg";
import BG2 from "../components/image/BG2.png";
import BG3 from "../components/image/BG3.png";

import { CarouselSection } from "@/components/ui/carousel-section";
import Footer from "@/components/ui/footer";

// Background images array
const BACKGROUNDS = [BG1, BG2, BG3];

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [mlAccounts, setMlAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const { t } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Memoized background styles
  const backgroundStyle = useMemo(
    () => ({
      backgroundImage: `url(${BACKGROUNDS[currentBgIndex].src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }),
    [currentBgIndex]
  );

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both ads and accounts in parallel
      const [adsResponse, mlResponse] = await Promise.all([
        supabase
          .from("ads")
          .select("*")
          .eq("is_active", true)
          .order("order_index"),
        supabase
          .from("accounts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setAds(adsResponse.data || []);
      setMlAccounts(mlResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Background rotation effect
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [loading]);

  // Auto-scroll functionality for carousel
  useEffect(() => {
    if (!emblaApi || ads.length <= 1) return;

    const autoScroll = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);

    return () => clearInterval(autoScroll);
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

  // Memoized carousel indicators
  const carouselIndicators = useMemo(() => {
    if (ads.length <= 0) return null;

    return (
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
    );
  }, [ads.length, activeSlide, emblaApi]);

  // Memoized carousel slides
  const carouselSlides = useMemo(() => {
    if (ads.length > 0) {
      return ads.map((ad) => (
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
      ));
    }

    return (
      <div className="flex-[0_0_100%] min-w-0">
        <div className="relative h-64 md:h-96 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center p-8 md:p-12">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              Welcome to Our Store
            </h2>
          </div>
        </div>
      </div>
    );
  }, [ads]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Navbar />
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />

      <div className="min-h-screen bg-background">
        {/* Hero Section with Carousel */}
        <section className="container mx-auto px-4 py-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card to-secondary">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">{carouselSlides}</div>
            </div>
            {carouselIndicators}
          </div>
        </section>

        {/* Button Section with Rotating Background */}
        <section
          className="relative container mx-auto px-4 py-8"
          style={backgroundStyle}
        >
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/30 transition-opacity duration-1000"></div>

          <div className="h-96 min-h-fit relative z-10">
            <div className="flex justify-center mb-16">
              <div className="text-center px-8 py-6 ">
                <h1 className="font-bold mb-7 text-4xl  py-2 backdrop-blur-md rounded-md bg-black/40 inline-block">
                   {t("hero.title1")}
                  <span className="text-primary">Ara Shi's Shop</span>
                </h1>
                <p className="text-lg text-gray-100">
                  Your trusted marketplace for premium game accounts and
                  professional boosting services
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-center">
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
            <CarouselSection title={t("hero.new_arrival_mlbb")}>
              {mlAccounts.map((account) => (
                <GameCard
                  id={account?.id}
                  key={account.id}
                  title={account.title}
                  image={account?.images?.[0]}
                  price={account.price}
                  skins={50}
                  collectorLevel={account.collector_level}
                  is_sold={account.is_sold}
                />
              ))}
            </CarouselSection>
          </section>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
